import axios from 'axios';

/**
 * API Service for interacting with the Newark-IT backend
 * This service provides methods for all API endpoints
 */

// Create axios instance with base URL and default configs
const API = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to inject auth token
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Customer endpoints
const customerAPI = {
  register: (customerData) => API.post('/customers', customerData),
  login: (credentials) => API.post('/auth/login', credentials),
  getProfile: () => API.get('/customers/profile'),
  updateProfile: (profileData) => API.put('/customers/profile', profileData),
  
  // Credit card methods
  getCreditCards: () => API.get('/credit-cards'),
  addCreditCard: (cardData) => API.post('/credit-cards', cardData),
  deleteCreditCard: (cardId) => API.delete(`/credit-cards/${cardId}`),
  
  // Shipping address methods
  getShippingAddresses: () => API.get('/shipping-addresses'),
  addShippingAddress: (addressData) => API.post('/shipping-addresses', addressData),
  updateShippingAddress: (addressId, addressData) => API.put(`/shipping-addresses/${addressId}`, addressData),
  deleteShippingAddress: (addressId) => API.delete(`/shipping-addresses/${addressId}`)
};

// Product endpoints
const productAPI = {
  getAllProducts: () => API.get('/products'),
  getProductById: (productId) => API.get(`/products/${productId}`),
  getProductsByType: (type) => API.get(`/products/type/${type}`),
  getSpecialOffers: () => API.get('/products/offers')
};

// Shopping basket endpoints
const basketAPI = {
  getBasket: () => API.get('/basket'),
  addToBasket: (productId, quantity) => API.post('/basket/items', { productId, quantity }),
  updateBasketItem: (productId, quantity) => API.put(`/basket/items/${productId}`, { quantity }),
  removeBasketItem: (productId) => API.delete(`/basket/items/${productId}`),
  clearBasket: () => API.delete('/basket')
};

// Transaction endpoints
const transactionAPI = {
  checkout: (checkoutData) => API.post('/transactions', checkoutData),
  getOrderHistory: () => API.get('/transactions'),
  getOrderById: (orderId) => API.get(`/transactions/${orderId}`)
};

// Statistics endpoints
const statisticsAPI = {
  getCreditCardStats: () => API.get('/statistics/credit-cards'),
  getBestCustomers: () => API.get('/statistics/best-customers'),
  getTopProducts: (startDate, endDate) => API.get('/statistics/top-products', { params: { startDate, endDate } }),
  getPopularProducts: (startDate, endDate) => API.get('/statistics/popular-products', { params: { startDate, endDate } }),
  getBasketTotals: (startDate, endDate) => API.get('/statistics/basket-totals', { params: { startDate, endDate } }),
  getProductTypeAvg: (startDate, endDate) => API.get('/statistics/product-type-avg', { params: { startDate, endDate } })
};

export {
  customerAPI,
  productAPI,
  basketAPI,
  transactionAPI,
  statisticsAPI
};

// Add a response interceptor to handle common errors
API.interceptors.response.use(response => {
  return response;
}, error => {
  // Handle unauthorized errors (401)
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});