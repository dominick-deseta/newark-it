const pool = require('../config/db');

// Get credit card statistics
exports.getCreditCardStats = async (req, res) => {
  try {
    // Total amount charged per credit card
    const [cardStats] = await pool.query(
      'SELECT c.CCNumber, CONCAT("****", RIGHT(c.CCNumber, 4)) AS MaskedNumber, ' +
      'c.CCType, SUM(a.Quantity * a.PriceSold) AS TotalAmount ' +
      'FROM TRANSACTION t ' +
      'JOIN APPEARS_IN a ON t.BID = a.BID ' +
      'JOIN CREDIT_CARD c ON t.CCNumber = c.CCNumber ' +
      'GROUP BY c.CCNumber, c.CCType ' +
      'ORDER BY TotalAmount DESC'
    );
    
    res.json(cardStats.map(card => ({
      cardNumber: card.MaskedNumber,
      cardType: card.CCType,
      totalAmount: parseFloat(card.TotalAmount)
    })));
  } catch (error) {
    console.error('Error getting credit card statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get top 10 best customers
exports.getBestCustomers = async (req, res) => {
  try {
    // Best customers based on total spending
    const [customers] = await pool.query(
      'SELECT c.CID, c.FName, c.LName, c.EMail, c.Status, ' +
      'SUM(a.Quantity * a.PriceSold) AS TotalSpent, ' +
      'COUNT(DISTINCT t.BID) AS OrderCount ' +
      'FROM CUSTOMER c ' +
      'JOIN TRANSACTION t ON c.CID = t.CID ' +
      'JOIN APPEARS_IN a ON t.BID = a.BID ' +
      'GROUP BY c.CID, c.FName, c.LName, c.EMail, c.Status ' +
      'ORDER BY TotalSpent DESC ' +
      'LIMIT 10'
    );
    
    res.json(customers.map(customer => ({
      id: customer.CID,
      name: `${customer.FName} ${customer.LName}`,
      email: customer.EMail,
      status: customer.Status,
      totalSpent: parseFloat(customer.TotalSpent),
      orderCount: customer.OrderCount
    })));
  } catch (error) {
    console.error('Error getting best customers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get most frequently sold products for a time period
exports.getTopProducts = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }
    
    // Most frequently sold products
    let query = 
      'SELECT p.PID, p.PName, p.PType, ' +
      'SUM(a.Quantity) AS TotalQuantity, ' +
      'SUM(a.Quantity * a.PriceSold) AS TotalRevenue ' +
      'FROM PRODUCT p ' +
      'JOIN APPEARS_IN a ON p.PID = a.PID ' +
      'JOIN TRANSACTION t ON a.BID = t.BID ' +
      'WHERE t.TDate BETWEEN ? AND ? ' +
      'GROUP BY p.PID, p.PName, p.PType ' +
      'ORDER BY TotalQuantity DESC';
    
    const [products] = await pool.query(query, [startDate, endDate]);
    
    res.json(products.map(product => ({
      pid: product.PID,
      name: product.PName,
      type: product.PType,
      quantity: parseInt(product.TotalQuantity),
      revenue: parseFloat(product.TotalRevenue)
    })));
  } catch (error) {
    console.error('Error getting top products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get products sold to most distinct customers for a time period
exports.getPopularProducts = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }
    
    // Products sold to highest number of distinct customers
    let query = 
      'SELECT p.PID, p.PName, p.PType, ' +
      'COUNT(DISTINCT t.CID) AS DistinctCustomers ' +
      'FROM PRODUCT p ' +
      'JOIN APPEARS_IN a ON p.PID = a.PID ' +
      'JOIN TRANSACTION t ON a.BID = t.BID ' +
      'WHERE t.TDate BETWEEN ? AND ? ' +
      'GROUP BY p.PID, p.PName, p.PType ' +
      'ORDER BY DistinctCustomers DESC';
    
    const [products] = await pool.query(query, [startDate, endDate]);
    
    res.json(products.map(product => ({
      pid: product.PID,
      name: product.PName,
      type: product.PType,
      distinctCustomers: parseInt(product.DistinctCustomers)
    })));
  } catch (error) {
    console.error('Error getting popular products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get maximum basket total per credit card for a time period
exports.getBasketTotals = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }
    
    // Maximum basket total amount per credit card
    let query = 
      'SELECT c.CCNumber, CONCAT("****", RIGHT(c.CCNumber, 4)) AS MaskedNumber, ' +
      'c.CCType, MAX(BasketTotal) AS MaxAmount, MaxDate ' +
      'FROM CREDIT_CARD c ' +
      'JOIN (' +
      '  SELECT t.CCNumber, t.BID, SUM(a.Quantity * a.PriceSold) AS BasketTotal, DATE(t.TDate) AS MaxDate ' +
      '  FROM TRANSACTION t ' +
      '  JOIN APPEARS_IN a ON t.BID = a.BID ' +
      '  WHERE t.TDate BETWEEN ? AND ? ' +
      '  GROUP BY t.CCNumber, t.BID, t.TDate' +
      ') AS basket_totals ON c.CCNumber = basket_totals.CCNumber ' +
      'GROUP BY c.CCNumber, c.CCType, MaxDate ' +
      'ORDER BY MaxAmount DESC';
    
    const [results] = await pool.query(query, [startDate, endDate]);
    
    res.json(results.map(result => ({
      cardNumber: result.MaskedNumber,
      cardType: result.CCType,
      maxAmount: parseFloat(result.MaxAmount),
      date: result.MaxDate
    })));
  } catch (error) {
    console.error('Error getting basket totals:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get average selling price per product type for a time period
exports.getProductTypeAvg = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }
    
    // Average selling product price per product type
    let query = 
      'SELECT p.PType, AVG(a.PriceSold) AS AvgPrice ' +
      'FROM PRODUCT p ' +
      'JOIN APPEARS_IN a ON p.PID = a.PID ' +
      'JOIN TRANSACTION t ON a.BID = t.BID ' +
      'WHERE t.TDate BETWEEN ? AND ? ' +
      'GROUP BY p.PType ' +
      'ORDER BY p.PType';
    
    const [results] = await pool.query(query, [startDate, endDate]);
    
    res.json(results.map(result => ({
      type: result.PType,
      avgPrice: parseFloat(result.AvgPrice)
    })));
  } catch (error) {
    console.error('Error getting product type averages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};