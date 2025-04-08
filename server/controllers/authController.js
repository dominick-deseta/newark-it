const pool = require('../config/db');

// Validate token and return user data
exports.validateToken = async (req, res) => {
  try {
    // The auth middleware already verified the token and attached the user to req.user
    const userId = req.user.id;
    
    // Get user data
    const [customers] = await pool.query(
      'SELECT CID, FName, LName, EMail, Status FROM CUSTOMER WHERE CID = ?',
      [userId]
    );
    
    if (customers.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const customer = customers[0];
    
    // Return user info
    res.json({
      user: {
        id: customer.CID,
        firstName: customer.FName,
        lastName: customer.LName,
        email: customer.EMail,
        status: customer.Status
      }
    });
  } catch (error) {
    console.error('Error validating token:', error);
    res.status(500).json({ message: 'Server error' });
  }
};