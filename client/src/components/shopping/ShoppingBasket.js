import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Form, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { formatPrice } from '../utils/utilities';

const ShoppingBasket = () => {
  const [basket, setBasket] = useState({ basketId: null, items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Fetch the current user's basket
  useEffect(() => {
    const fetchBasket = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch the user's basket from the backend
        const response = await axios.get('http://localhost:3001/api/basket');
        setBasket(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching basket:', err);
        setError('Failed to load your shopping basket. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBasket();
  }, [isAuthenticated]);
  
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      // Update the basket item quantity in the backend
      await axios.put(`http://localhost:3001/api/basket/items/${productId}`, { quantity: newQuantity });
      
      // Update the basket in the frontend
      setBasket(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.PID === productId ? { ...item, Quantity: newQuantity } : item
        ),
        total: prev.items.reduce((total, item) => {
          return total + (item.PriceSold * (item.PID === productId ? newQuantity : item.Quantity));
        }, 0)
      }));
      
      setUpdateSuccess('Basket updated successfully');
      setTimeout(() => setUpdateSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating basket item:', err);
      setError('Failed to update item quantity. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };
  
  const removeItem = async (productId) => {
    try {
      // Remove the item from the backend
      await axios.delete(`http://localhost:3001/api/basket/items/${productId}`);
      
      // Update the basket in the frontend
      const updatedItems = basket.items.filter(item => item.PID !== productId);
      setBasket(prev => ({
        ...prev,
        items: updatedItems,
        total: updatedItems.reduce((total, item) => {
          return total + (item.PriceSold * item.Quantity);
        }, 0)
      }));
      
      setUpdateSuccess('Item removed from basket');
      setTimeout(() => setUpdateSuccess(''), 3000);
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item from basket. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };
  
  const handleCheckout = () => {
    navigate('/checkout');
  };
  
  if (!isAuthenticated) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <h3 className="mb-4">Please Login to View Your Basket</h3>
          <p>You need to be logged in to view and manage your shopping basket.</p>
          <Button as={Link} to="/login" variant="primary">
            Login
          </Button>
        </Card.Body>
      </Card>
    );
  }
  
  if (loading) {
    return <div className="text-center my-5">Loading your basket...</div>;
  }
  
  if (error) {
    return <Alert variant="danger" className="my-3">{error}</Alert>;
  }
  
  if (!basket.items || basket.items.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <h3 className="mb-4">Your Shopping Basket is Empty</h3>
          <p>Looks like you haven't added any products to your basket yet.</p>
          <Button as={Link} to="/products" variant="primary">
            Browse Products
          </Button>
        </Card.Body>
      </Card>
    );
  }
  
  return (
    <div>
      <h2 className="mb-4">Your Shopping Basket</h2>
      
      {updateSuccess && (
        <Alert variant="success" onClose={() => setUpdateSuccess('')} dismissible>
          {updateSuccess}
        </Alert>
      )}
      
      <Table responsive striped bordered>
        <thead>
          <tr>
            <th>Product</th>
            <th>Type</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {basket.items.map(item => (
            <tr key={item.PID}>
              <td>
                <Link to={`/products/${item.PID}`}>
                  {item.PName}
                </Link>
              </td>
              <td>{item.PType}</td>
              <td>${formatPrice(item.PriceSold)}</td>
              <td>
                <div className="d-flex align-items-center">
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => updateQuantity(item.PID, item.Quantity - 1)}
                    disabled={item.Quantity <= 1}
                  >
                    -
                  </Button>
                  <Form.Control
                    type="number"
                    min="1"
                    value={item.Quantity}
                    onChange={(e) => updateQuantity(item.PID, parseInt(e.target.value) || 1)}
                    className="mx-2"
                    style={{ width: '60px' }}
                  />
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => updateQuantity(item.PID, item.Quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </td>
              <td>${formatPrice(item.PriceSold * item.Quantity)}</td>
              <td>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => removeItem(item.PID)}
                >
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="4" className="text-end fw-bold">Total:</td>
            <td className="fw-bold">${formatPrice(basket.total)}</td>
            <td></td>
          </tr>
        </tfoot>
      </Table>
      
      <div className="d-flex justify-content-end mt-4">
        <Button as={Link} to="/products" variant="outline-secondary" className="me-2">
          Continue Shopping
        </Button>
        <Button variant="success" onClick={handleCheckout}>
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
};

export default ShoppingBasket;