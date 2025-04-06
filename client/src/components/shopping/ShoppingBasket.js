import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Form, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ShoppingBasket = () => {
  const [basketItems, setBasketItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // In a real app, you would fetch the current user's basket
  useEffect(() => {
    const fetchBasket = async () => {
      try {
        setLoading(true);
        
        // This is a placeholder. In a real app, you would fetch from your API
        // const response = await axios.get('http://localhost:3001/api/basket');
        // setBasketItems(response.data);
        
        // Placeholder data for development
        setBasketItems([
          {
            PID: 1,
            PName: 'Dell XPS 13',
            PType: 'laptop',
            PPrice: 1299.99,
            Quantity: 1,
            PriceSold: 1299.99
          },
          {
            PID: 3,
            PName: 'HP LaserJet Pro',
            PType: 'printer',
            PPrice: 349.99,
            Quantity: 2,
            PriceSold: 349.99
          }
        ]);
        
        setError('');
      } catch (err) {
        console.error('Error fetching basket:', err);
        setError('Failed to load your shopping basket. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBasket();
  }, []);
  
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setBasketItems(prevItems => 
      prevItems.map(item => 
        item.PID === productId ? { ...item, Quantity: newQuantity } : item
      )
    );
    
    // In a real app, you would call the API to update the quantity
    // axios.put(`http://localhost:3001/api/basket/items/${productId}`, { quantity: newQuantity });
  };
  
  const removeItem = (productId) => {
    setBasketItems(prevItems => 
      prevItems.filter(item => item.PID !== productId)
    );
    
    // In a real app, you would call the API to remove the item
    // axios.delete(`http://localhost:3001/api/basket/items/${productId}`);
  };
  
  const calculateTotal = () => {
    return basketItems.reduce((total, item) => {
      return total + (item.PriceSold * item.Quantity);
    }, 0);
  };
  
  const handleCheckout = () => {
    navigate('/checkout');
  };
  
  if (loading) {
    return <div className="text-center my-5">Loading your basket...</div>;
  }
  
  if (error) {
    return <div className="alert alert-danger my-3">{error}</div>;
  }
  
  if (basketItems.length === 0) {
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
          {basketItems.map(item => (
            <tr key={item.PID}>
              <td>{item.PName}</td>
              <td>{item.PType}</td>
              <td>${item.PriceSold.toFixed(2)}</td>
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
              <td>${(item.PriceSold * item.Quantity).toFixed(2)}</td>
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
            <td className="fw-bold">${calculateTotal().toFixed(2)}</td>
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