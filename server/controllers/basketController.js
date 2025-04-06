const pool = require('../config/db');

// Get the current user's basket
exports.getBasket = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find active basket or create one
    let basketId;
    
    // Check if user has an active basket (not completed in a transaction)
    const [baskets] = await pool.query(
      'SELECT b.BID FROM BASKET b LEFT JOIN TRANSACTION t ON b.BID = t.BID ' +
      'WHERE b.CID = ? AND t.BID IS NULL',
      [userId]
    );
    
    if (baskets.length > 0) {
      // Use existing basket
      basketId = baskets[0].BID;
    } else {
      // Create a new basket
      const [result] = await pool.query(
        'INSERT INTO BASKET (CID) VALUES (?)',
        [userId]
      );
      
      basketId = result.insertId;
    }
    
    // Get items in the basket
    const [items] = await pool.query(
      'SELECT a.BID, a.PID, a.Quantity, a.PriceSold, p.PName, p.PType, p.PDescription ' +
      'FROM APPEARS_IN a JOIN PRODUCT p ON a.PID = p.PID WHERE a.BID = ?',
      [basketId]
    );
    
    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.PriceSold * item.Quantity), 0);
    
    res.json({
      basketId,
      items,
      total
    });
  } catch (error) {
    console.error('Error getting basket:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add an item to the basket
exports.addItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    // Validate quantity
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }
    
    // Check if product exists and has enough inventory
    const [products] = await pool.query(
      'SELECT * FROM PRODUCT WHERE PID = ?',
      [productId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const product = products[0];
    
    if (product.PQuantity < quantity) {
      return res.status(400).json({ message: 'Not enough inventory' });
    }
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Check if user has a basket
      let basketId;
      
      // Find active basket
      const [baskets] = await connection.query(
        'SELECT b.BID FROM BASKET b LEFT JOIN TRANSACTION t ON b.BID = t.BID ' +
        'WHERE b.CID = ? AND t.BID IS NULL',
        [userId]
      );
      
      if (baskets.length > 0) {
        // Use existing basket
        basketId = baskets[0].BID;
      } else {
        // Create a new basket
        const [result] = await connection.query(
          'INSERT INTO BASKET (CID) VALUES (?)',
          [userId]
        );
        
        basketId = result.insertId;
      }
      
      // Check if product already in basket
      const [basketItems] = await connection.query(
        'SELECT * FROM APPEARS_IN WHERE BID = ? AND PID = ?',
        [basketId, productId]
      );
      
      // Determine the price to use (offer price or regular price)
      let priceToUse = product.PPrice;
      
      // Check if user is gold/platinum to get offer price
      const [customerStatus] = await connection.query(
        'SELECT Status FROM CUSTOMER WHERE CID = ?',
        [userId]
      );
      
      const isEligibleForOffers = ['gold', 'platinum'].includes(customerStatus[0].Status);
      
      if (isEligibleForOffers) {
        // Check if product is on offer
        const [offers] = await connection.query(
          'SELECT * FROM OFFER_PRODUCT WHERE PID = ?',
          [productId]
        );
        
        if (offers.length > 0) {
          priceToUse = offers[0].OfferPrice;
        }
      }
      
      if (basketItems.length > 0) {
        // Update quantity if already in basket
        await connection.query(
          'UPDATE APPEARS_IN SET Quantity = Quantity + ? WHERE BID = ? AND PID = ?',
          [quantity, basketId, productId]
        );
      } else {
        // Add new item to basket
        await connection.query(
          'INSERT INTO APPEARS_IN (BID, PID, Quantity, PriceSold) VALUES (?, ?, ?, ?)',
          [basketId, productId, quantity, priceToUse]
        );
      }
      
      await connection.commit();
      
      res.status(201).json({
        message: 'Item added to basket',
        basketId,
        productId,
        quantity,
        priceSold: priceToUse
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error adding item to basket:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update quantity of an item in the basket
exports.updateItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }
    
    // Check if product exists and has enough inventory
    const [products] = await pool.query(
      'SELECT * FROM PRODUCT WHERE PID = ?',
      [productId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const product = products[0];
    
    if (product.PQuantity < quantity) {
      return res.status(400).json({ message: 'Not enough inventory' });
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
    
    // Check if product is in the basket
    const [basketItems] = await pool.query(
      'SELECT * FROM APPEARS_IN WHERE BID = ? AND PID = ?',
      [basketId, productId]
    );
    
    if (basketItems.length === 0) {
      return res.status(404).json({ message: 'Item not found in basket' });
    }
    
    // Update quantity
    await pool.query(
      'UPDATE APPEARS_IN SET Quantity = ? WHERE BID = ? AND PID = ?',
      [quantity, basketId, productId]
    );
    
    res.json({
      message: 'Item quantity updated',
      basketId,
      productId,
      quantity
    });
  } catch (error) {
    console.error('Error updating basket item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove an item from the basket
exports.removeItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;
    
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
    
    // Check if product is in the basket
    const [basketItems] = await pool.query(
      'SELECT * FROM APPEARS_IN WHERE BID = ? AND PID = ?',
      [basketId, productId]
    );
    
    if (basketItems.length === 0) {
      return res.status(404).json({ message: 'Item not found in basket' });
    }
    
    // Remove item
    await pool.query(
      'DELETE FROM APPEARS_IN WHERE BID = ? AND PID = ?',
      [basketId, productId]
    );
    
    // Check if basket is now empty
    const [remainingItems] = await pool.query(
      'SELECT * FROM APPEARS_IN WHERE BID = ?',
      [basketId]
    );
    
    if (remainingItems.length === 0) {
      // If basket is empty, optionally delete it
      await pool.query(
        'DELETE FROM BASKET WHERE BID = ?',
        [basketId]
      );
    }
    
    res.json({
      message: 'Item removed from basket',
      basketId,
      productId
    });
  } catch (error) {
    console.error('Error removing basket item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear the entire basket
exports.clearBasket = async (req, res) => {
  try {
    const userId = req.user.id;
    
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
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Remove all items
      await connection.query(
        'DELETE FROM APPEARS_IN WHERE BID = ?',
        [basketId]
      );
      
      // Delete the basket
      await connection.query(
        'DELETE FROM BASKET WHERE BID = ?',
        [basketId]
      );
      
      await connection.commit();
      
      res.json({
        message: 'Basket cleared successfully'
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error clearing basket:', error);
    res.status(500).json({ message: 'Server error' });
  }
};