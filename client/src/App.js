import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Auth context
import { AuthProvider } from './components/auth/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Common components
import Header from './components/common/Header';
import Navigation from './components/common/Navigation';
import Footer from './components/common/Footer';

// Customer components
import CustomerRegistration from './components/customer/Registration';
import Login from './components/customer/Login';
import CustomerProfile from './components/customer/Profile';
import CreditCardForm from './components/customer/CreditCardForm';
import ShippingAddressForm from './components/customer/ShippingAddressForm';

// Shopping components
import ProductList from './components/shopping/ProductList';
import ProductDetail from './components/shopping/ProductDetail';
import ShoppingBasket from './components/shopping/ShoppingBasket';
import Checkout from './components/shopping/Checkout';
import OrderHistory from './components/shopping/OrderHistory';

// Statistics components
import SalesStatistics from './components/statistics/SalesStatistics';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container d-flex flex-column min-vh-100">
          <Header />
          <Navigation />
          <main className="container py-4 flex-grow-1">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<ProductList />} />
              <Route path="/register" element={<CustomerRegistration />} />
              <Route path="/login" element={<Login />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              
              {/* Protected routes - require authentication */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<CustomerProfile />} />
                <Route path="/profile/credit-card" element={<CreditCardForm />} />
                <Route path="/profile/shipping-address" element={<ShippingAddressForm />} />
                <Route path="/basket" element={<ShoppingBasket />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/statistics" element={<SalesStatistics />} />
              </Route>
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;