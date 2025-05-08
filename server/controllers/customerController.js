const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new customer
exports.registerCustomer = async (req, res) => {
  try {
    const { firstName, lastName, email, address, phone, password } = req.body;
    
    // Check if email already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM CUSTOMER WHERE EMail = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Hash password 
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new customer
    const [result] = await pool.query(
      'INSERT INTO CUSTOMER (FName, LName, EMail, Address, Phone, CPassword) VALUES (?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, address, phone, hashedPassword]
    );
        
    // Generate JWT token
    const token = jwt.sign(
      { user: { id: result.insertId, email } },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Customer registered successfully',
      token,
      customer: {
        id: result.insertId,
        firstName,
        lastName,
        email,
        status: 'regular' // Default status for new customers
      }
    });
  } catch (error) {
    console.error('Error registering customer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login customer
exports.loginCustomer = async (req, res) => {
  try {
    console.log("logging in customer");
    const { email, password } = req.body;
    
    // Find customer by email
    const [customers] = await pool.query(
      'SELECT * FROM CUSTOMER WHERE EMail = ?',
      [email]
    );
    
    if (customers.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const customer = customers[0];
    // console.log(customer);
    // Verify password against stored hash    
    const isMatch = await bcrypt.compare(password, customer.CPassword);

    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { user: { id: customer.CID, email: customer.EMail } },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      customer: {
        id: customer.CID,
        firstName: customer.FName,
        lastName: customer.LName,
        email: customer.EMail,
        status: customer.Status
      }
    });
  } catch (error) {
    console.error('Error logging in customer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get customer profile
exports.getCustomerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get customer data
    const [customers] = await pool.query(
      'SELECT * FROM CUSTOMER WHERE CID = ?',
      [userId]
    );
    
    if (customers.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const customer = customers[0];
    
    // Check if silver or above to get credit line
    let creditLine = null;
    if (['silver', 'gold', 'platinum'].includes(customer.Status)) {
      const [creditResult] = await pool.query(
        'SELECT CreditLine FROM SILVER_AND_ABOVE WHERE CID = ?',
        [userId]
      );
      
      if (creditResult.length > 0) {
        creditLine = creditResult[0].CreditLine;
      }
    }
    
    res.json({
      id: customer.CID,
      firstName: customer.FName,
      lastName: customer.LName,
      email: customer.EMail,
      address: customer.Address,
      phone: customer.Phone,
      status: customer.Status,
      creditLine
    });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update customer profile
exports.updateCustomerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, address, phone } = req.body;
    
    // Update customer data
    await pool.query(
      'UPDATE CUSTOMER SET FName = ?, LName = ?, Address = ?, Phone = ? WHERE CID = ?',
      [firstName, lastName, address, phone, userId]
    );
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get customer's credit cards
exports.getCreditCards = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get credit cards
    const [cards] = await pool.query(
      'SELECT CCNumber, CONCAT("****", RIGHT(CCNumber, 4)) as MaskedNumber, SecNumber, OwnerName, CCType, BilAddress, ExpDate FROM CREDIT_CARD WHERE StoredCardCID = ?',
      [userId]
    );
    
    res.json(cards.map(card => ({
      id: card.CCNumber,
      cardNumber: card.MaskedNumber,
      ownerName: card.OwnerName,
      cardType: card.CCType,
      billingAddress: card.BilAddress,
      expiryDate: new Date(card.ExpDate).toISOString().slice(0, 10)
    })));
  } catch (error) {
    console.error('Error fetching credit cards:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add credit card
exports.addCreditCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cardNumber, securityCode, ownerName, cardType, billingAddress, expiryDate } = req.body;
    
    // Insert credit card
    await pool.query(
      'INSERT INTO CREDIT_CARD (CCNumber, SecNumber, OwnerName, CCType, BilAddress, ExpDate, StoredCardCID) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [cardNumber, securityCode, ownerName, cardType, billingAddress, expiryDate, userId]
    );
    
    res.status(201).json({ message: 'Credit card added successfully' });
  } catch (error) {
    console.error('Error adding credit card:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete credit card
exports.deleteCreditCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const cardId = req.params.id;
    
    // Delete credit card
    await pool.query(
      'DELETE FROM CREDIT_CARD WHERE CCNumber = ? AND StoredCardCID = ?',
      [cardId, userId]
    );
    
    res.json({ message: 'Credit card removed successfully' });
  } catch (error) {
    console.error('Error deleting credit card:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get shipping addresses
exports.getShippingAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get shipping addresses
    const [addresses] = await pool.query(
      'SELECT * FROM SHIPPING_ADDRESS WHERE CID = ?',
      [userId]
    );
    
    res.json(addresses.map(address => ({
      id: address.SAName,
      name: address.SAName,
      recipientName: address.RecipientName,
      street: address.Street,
      streetNumber: address.SNumber,
      city: address.City,
      zipCode: address.Zip,
      state: address.State,
      country: address.Country
    })));
  } catch (error) {
    console.error('Error fetching shipping addresses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add shipping address
exports.addShippingAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressName, recipientName, street, streetNumber, city, zipCode, state, country } = req.body;
    
    // Check if address name already exists for this user
    const [existingAddresses] = await pool.query(
      'SELECT * FROM SHIPPING_ADDRESS WHERE CID = ? AND SAName = ?',
      [userId, addressName]
    );
    
    if (existingAddresses.length > 0) {
      return res.status(400).json({ message: 'Address name already exists' });
    }
    
    // Insert shipping address
    await pool.query(
      'INSERT INTO SHIPPING_ADDRESS (CID, SAName, RecipientName, Street, SNumber, City, Zip, State, Country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, addressName, recipientName, street, streetNumber, city, zipCode, state, country]
    );
    
    res.status(201).json({ message: 'Shipping address added successfully' });
  } catch (error) {
    console.error('Error adding shipping address:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update shipping address
exports.updateShippingAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressName = req.params.id;
    const { recipientName, street, streetNumber, city, zipCode, state, country } = req.body;
    
    // Update shipping address
    await pool.query(
      'UPDATE SHIPPING_ADDRESS SET RecipientName = ?, Street = ?, SNumber = ?, City = ?, Zip = ?, State = ?, Country = ? WHERE CID = ? AND SAName = ?',
      [recipientName, street, streetNumber, city, zipCode, state, country, userId, addressName]
    );
    
    res.json({ message: 'Shipping address updated successfully' });
  } catch (error) {
    console.error('Error updating shipping address:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete shipping address
exports.deleteShippingAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressName = req.params.id;
    
    // Delete shipping address
    await pool.query(
      'DELETE FROM SHIPPING_ADDRESS WHERE CID = ? AND SAName = ?',
      [userId, addressName]
    );
    
    res.json({ message: 'Shipping address removed successfully' });
  } catch (error) {
    console.error('Error deleting shipping address:', error);
    res.status(500).json({ message: 'Server error' });
  }
};