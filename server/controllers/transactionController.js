const pool = require('../config/db');

// Create a new transaction (checkout)
exports.createTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      shippingAddressId,
      paymentMethod,
      savedCardId,
      newCard
    } = req.body;
    
    if (!shippingAddressId) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }
    
    // Validate shipping address
    const [addresses] = await pool.query(
      'SELECT * FROM SHIPPING_ADDRESS WHERE CID = ? AND SAName = ?',
      [userId, shippingAddressId]
    );
    
    if (addresses.length === 0) {
      return res.status(400).json({ message: 'Invalid shipping address' });
    }
    
    // Get credit card information
    let creditCardNumber;
    
    if (paymentMethod === 'saved') {
      if (!savedCardId) {
        return res.status(400).json({ message: 'Saved card ID is required' });
      }
      
      // Validate saved card
      const [cards] = await pool.query(
        'SELECT * FROM CREDIT_CARD WHERE CCNumber = ? AND StoredCardCID = ?',
        [savedCardId, userId]
      );
      
      if (cards.length === 0) {
        return res.status(400).json({ message: 'Invalid credit card' });
      }
      
      creditCardNumber = savedCardId;
    } else if (paymentMethod === 'new') {
      if (!newCard || !newCard.cardNumber || !newCard.securityCode || 
          !newCard.ownerName || !newCard.billingAddress || !newCard.expiryDate) {
        return res.status(400).json({ message: 'All credit card details are required' });
      }
      
      // Create a new credit card
      try {
        await pool.query(
          'INSERT INTO CREDIT_CARD (CCNumber, SecNumber, OwnerName, CCType, BilAddress, ExpDate, StoredCardCID) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            newCard.cardNumber,
            newCard.securityCode,
            newCard.ownerName,
            newCard.cardType || 'Visa',
            newCard.billingAddress,
            newCard.expiryDate,
            newCard.saveCard ? userId : null
          ]
        );
        
        creditCardNumber = newCard.cardNumber;
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          // Card already exists, just use it
          creditCardNumber = newCard.cardNumber;
        } else {
          throw error;
        }
      }
    } else {
      return res.status(400).json({ message: 'Invalid payment method' });
    }
    
    // Get user's active basket
    const [baskets] = await pool.query(
      'SELECT b.BID FROM BASKET b LEFT JOIN TRANSACTION t ON b.BID = t.BID ' +
      'WHERE b.CID = ? AND t.BID IS NULL',
      [userId]
    );
    
    if (baskets.length === 0) {
      return res.status(404).json({ message: 'No active basket found' });
    }
    
    const basketId = baskets[0].BID;
    
    // Check if basket has items
    const [basketItems] = await pool.query(
      'SELECT * FROM APPEARS_IN WHERE BID = ?',
      [basketId]
    );
    
    if (basketItems.length === 0) {
      return res.status(400).json({ message: 'Basket is empty' });
    }
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Create transaction record
      await connection.query(
        'INSERT INTO TRANSACTION (BID, CCNumber, CID, SAName, TDate, TTag) VALUES (?, ?, ?, ?, NOW(), ?)',
        [basketId, creditCardNumber, userId, shippingAddressId, 'delivered']
      );
      
      // Update product inventory
      for (const item of basketItems) {
        await connection.query(
          'UPDATE PRODUCT SET PQuantity = PQuantity - ? WHERE PID = ?',
          [item.Quantity, item.PID]
        );
      }
      
      await connection.commit();
      
      res.status(201).json({
        message: 'Order placed successfully',
        orderId: basketId
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all user transactions
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get transactions
    const [transactions] = await pool.query(
      'SELECT t.BID, t.CCNumber, CONCAT("****", RIGHT(t.CCNumber, 4)) AS MaskedCCNumber, ' +
      't.SAName, t.TDate, t.TTag, sa.RecipientName, sa.Street, sa.SNumber, sa.City, sa.Zip, sa.State, sa.Country ' +
      'FROM TRANSACTION t ' +
      'JOIN SHIPPING_ADDRESS sa ON t.CID = sa.CID AND t.SAName = sa.SAName ' +
      'WHERE t.CID = ? ' +
      'ORDER BY t.TDate DESC',
      [userId]
    );
    
    // Get transaction items and calculate totals
    for (const transaction of transactions) {
      const [items] = await pool.query(
        'SELECT a.BID, a.PID, a.Quantity, a.PriceSold, p.PName, p.PType ' +
        'FROM APPEARS_IN a JOIN PRODUCT p ON a.PID = p.PID WHERE a.BID = ?',
        [transaction.BID]
      );
      
      transaction.items = items;
      transaction.totalAmount = items.reduce((sum, item) => sum + (item.PriceSold * item.Quantity), 0);
      transaction.itemCount = items.length;
    }
    
    res.json(transactions);
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;
    
    // Get transaction
    const [transactions] = await pool.query(
      'SELECT t.BID, t.CCNumber, CONCAT("****", RIGHT(t.CCNumber, 4)) AS MaskedCCNumber, ' +
      't.SAName, t.TDate, t.TTag, sa.RecipientName, sa.Street, sa.SNumber, sa.City, sa.Zip, sa.State, sa.Country ' +
      'FROM TRANSACTION t ' +
      'JOIN SHIPPING_ADDRESS sa ON t.CID = sa.CID AND t.SAName = sa.SAName ' +
      'WHERE t.BID = ? AND t.CID = ?',
      [transactionId, userId]
    );
    
    if (transactions.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    const transaction = transactions[0];
    
    // Get transaction items
    const [items] = await pool.query(
      'SELECT a.BID, a.PID, a.Quantity, a.PriceSold, p.PName, p.PType, p.PDescription ' +
      'FROM APPEARS_IN a JOIN PRODUCT p ON a.PID = p.PID WHERE a.BID = ?',
      [transaction.BID]
    );
    
    transaction.items = items;
    transaction.totalAmount = items.reduce((sum, item) => sum + (item.PriceSold * item.Quantity), 0);
    
    res.json(transaction);
  } catch (error) {
    console.error('Error getting transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Filter transactions by criteria
exports.filterTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productName, startDate, endDate } = req.query;
    
    let query = 'SELECT DISTINCT t.BID, t.TDate, t.TTag FROM TRANSACTION t ';
    const params = [userId];
    
    if (productName) {
      query += 'JOIN APPEARS_IN a ON t.BID = a.BID JOIN PRODUCT p ON a.PID = p.PID ';
    }
    
    query += 'WHERE t.CID = ? ';
    
    if (productName) {
      query += 'AND p.PName LIKE ? ';
      params.push(`%${productName}%`);
    }
    
    if (startDate) {
      query += 'AND t.TDate >= ? ';
      params.push(startDate);
    }
    
    if (endDate) {
      query += 'AND t.TDate <= ? ';
      params.push(endDate);
    }
    
    query += 'ORDER BY t.TDate DESC';
    
    // Get filtered transactions
    const [transactionIds] = await pool.query(query, params);
    
    // Get full transaction details
    const transactions = [];
    
    for (const { BID } of transactionIds) {
      const [transactionDetails] = await pool.query(
        'SELECT t.BID, t.CCNumber, CONCAT("****", RIGHT(t.CCNumber, 4)) AS MaskedCCNumber, ' +
        't.SAName, t.TDate, t.TTag, sa.RecipientName, sa.Street, sa.SNumber, sa.City, sa.Zip, sa.State, sa.Country ' +
        'FROM TRANSACTION t ' +
        'JOIN SHIPPING_ADDRESS sa ON t.CID = sa.CID AND t.SAName = sa.SAName ' +
        'WHERE t.BID = ? AND t.CID = ?',
        [BID, userId]
      );
      
      if (transactionDetails.length > 0) {
        const transaction = transactionDetails[0];
        
        // Get transaction items
        const [items] = await pool.query(
          'SELECT a.BID, a.PID, a.Quantity, a.PriceSold, p.PName, p.PType ' +
          'FROM APPEARS_IN a JOIN PRODUCT p ON a.PID = p.PID WHERE a.BID = ?',
          [transaction.BID]
        );
        
        transaction.items = items;
        transaction.totalAmount = items.reduce((sum, item) => sum + (item.PriceSold * item.Quantity), 0);
        transaction.itemCount = items.length;
        
        transactions.push(transaction);
      }
    }
    
    res.json(transactions);
  } catch (error) {
    console.error('Error filtering transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;
    const { status } = req.body;
    
    if (!['delivered', 'not-delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    // Check if transaction exists and belongs to user
    const [transactions] = await pool.query(
      'SELECT * FROM TRANSACTION WHERE BID = ? AND CID = ?',
      [transactionId, userId]
    );
    
    if (transactions.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Update status
    await pool.query(
      'UPDATE TRANSACTION SET TTag = ? WHERE BID = ?',
      [status, transactionId]
    );
    
    res.json({
      message: 'Delivery status updated successfully',
      transactionId,
      status
    });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};