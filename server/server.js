const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const customerRoutes = require('./routes/customerRoutes');
const productRoutes = require('./routes/productRoutes');
const basketRoutes = require('./routes/basketRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const authRoutes = require('./routes/authRoutes');

// Use routes
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/basket', basketRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Newark-IT API is running');
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});