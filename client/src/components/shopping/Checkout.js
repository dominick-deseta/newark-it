import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, ListGroup, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Checkout = () => {
  const navigate = useNavigate();
  const [basketItems, setBasketItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [savedCreditCards, setSavedCreditCards] = useState([]);
  
  const [formData, setFormData] = useState({
    shippingAddressId: '',
    paymentMethod: 'saved',
    savedCardId: '',
    newCard: {
      cardNumber: '',
      securityCode: '',
      ownerName: '',
      expiryDate: '',
      billingAddress: '',
      cardType: 'Visa'
    },
    saveNewCard: false
  });
  
  // Fetch basket items, saved addresses and credit cards
  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would fetch these from your API
        // const basketResponse = await axios.get('http://localhost:3001/api/basket');
        // const addressesResponse = await axios.get('http://localhost:3001/api/shipping-addresses');
        // const cardsResponse = await axios.get('http://localhost:3001/api/credit-cards');
        
        // Mock data for development
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
        
        setShippingAddresses([
          { id: '1', name: 'Home', recipientName: 'John Doe', fullAddress: '123 Main St, New York, NY 10001' },
          { id: '2', name: 'Office', recipientName: 'John Doe', fullAddress: '456 Business Ave, Newark, NJ 07102' }
        ]);
        
        setSavedCreditCards([
          { id: '1', last4: '4242', cardType: 'Visa', expiryDate: '12/25' },
          { id: '2', last4: '1234', cardType: 'Mastercard', expiryDate: '08/26' }
        ]);
        
        if (shippingAddresses.length > 0) {
          setFormData(prev => ({
            ...prev,
            shippingAddressId: shippingAddresses[0].id
          }));
        }
        
        if (savedCreditCards.length > 0) {
          setFormData(prev => ({
            ...prev,
            savedCardId: savedCreditCards[0].id
          }));
        }
        
        setError('');
      } catch (err) {
        console.error('Error fetching checkout data:', err);
        setError('Failed to load checkout data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCheckoutData();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('newCard.')) {
      const cardField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        newCard: {
          ...prev.newCard,
          [cardField]: value
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const calculateTotal = () => {
    return basketItems.reduce((total, item) => {
      return total + (item.PriceSold * item.Quantity);
    }, 0);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // In a real app, you would submit the order to your API
      // const response = await axios.post('http://localhost:3001/api/transactions', {
      //   shippingAddressId: formData.shippingAddressId,
      //   paymentMethod: formData.paymentMethod,
      //   savedCardId: formData.savedCardId,
      //   newCard: formData.paymentMethod === 'new' ? formData.newCard : undefined,
      //   saveNewCard: formData.saveNewCard
      // });
      
      console.log('Order submitted:', formData);
      
      // Show success message
      setSuccess(true);
      
      // Clear basket (in a real app)
      // await axios.delete('http://localhost:3001/api/basket');
      
      // Redirect to order confirmation after a delay
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
    } catch (err) {
      console.error('Error submitting order:', err);
      setError('Failed to submit your order. Please try again.');
    }
  };
  
  if (loading) {
    return <div className="text-center my-5">Loading checkout information...</div>;
  }
  
  if (basketItems.length === 0 && !loading) {
    return (
      <Alert variant="warning">
        Your basket is empty. Please add items to your basket before checkout.
      </Alert>
    );
  }
  
  return (
    <div>
      <h2 className="mb-4">Checkout</h2>
      
      {success && (
        <Alert variant="success">
          Your order has been successfully placed! Redirecting to your orders...
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}
      
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Shipping Information</Card.Title>
              
              {shippingAddresses.length === 0 ? (
                <Alert variant="info">
                  You don't have any saved shipping addresses. Please add one to continue.
                </Alert>
              ) : (
                <Form.Group className="mb-3">
                  <Form.Label>Select a shipping address</Form.Label>
                  <Form.Select 
                    name="shippingAddressId"
                    value={formData.shippingAddressId}
                    onChange={handleInputChange}
                  >
                    {shippingAddresses.map(address => (
                      <option key={address.id} value={address.id}>
                        {address.name} - {address.recipientName}, {address.fullAddress}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
              
              <div className="text-end">
                <Button variant="outline-primary" size="sm" onClick={() => navigate('/profile/shipping-address')}>
                  Add New Address
                </Button>
              </div>
            </Card.Body>
          </Card>
          
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Payment Method</Card.Title>
              
              <Form.Group className="mb-3">
                <Form.Check
                  type="radio"
                  id="saved-card"
                  label="Use saved credit card"
                  name="paymentMethod"
                  value="saved"
                  checked={formData.paymentMethod === 'saved'}
                  onChange={handleInputChange}
                  disabled={savedCreditCards.length === 0}
                />
                
                {formData.paymentMethod === 'saved' && savedCreditCards.length > 0 && (
                  <Form.Select 
                    name="savedCardId"
                    value={formData.savedCardId}
                    onChange={handleInputChange}
                    className="mt-2 ms-4"
                  >
                    {savedCreditCards.map(card => (
                      <option key={card.id} value={card.id}>
                        {card.cardType} ending in {card.last4} (Expires: {card.expiryDate})
                      </option>
                    ))}
                  </Form.Select>
                )}
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Check
                  type="radio"
                  id="new-card"
                  label="Use a new credit card"
                  name="paymentMethod"
                  value="new"
                  checked={formData.paymentMethod === 'new'}
                  onChange={handleInputChange}
                />
                
                {formData.paymentMethod === 'new' && (
                  <div className="mt-3 ms-4">
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Card Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="newCard.cardNumber"
                            value={formData.newCard.cardNumber}
                            onChange={handleInputChange}
                            placeholder="1234 5678 9012 3456"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Security Code</Form.Label>
                          <Form.Control
                            type="text"
                            name="newCard.securityCode"
                            value={formData.newCard.securityCode}
                            onChange={handleInputChange}
                            placeholder="123"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Cardholder Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="newCard.ownerName"
                            value={formData.newCard.ownerName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Expiry Date</Form.Label>
                          <Form.Control
                            type="text"
                            name="newCard.expiryDate"
                            value={formData.newCard.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Billing Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="newCard.billingAddress"
                        value={formData.newCard.billingAddress}
                        onChange={handleInputChange}
                        placeholder="1234 Main St, City, State, Zip"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Card Type</Form.Label>
                      <Form.Select
                        name="newCard.cardType"
                        value={formData.newCard.cardType}
                        onChange={handleInputChange}
                      >
                        <option value="Visa">Visa</option>
                        <option value="Mastercard">Mastercard</option>
                        <option value="Amex">American Express</option>
                        <option value="Discover">Discover</option>
                      </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        id="save-card"
                        label="Save this card for future purchases"
                        name="saveNewCard"
                        checked={formData.saveNewCard}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </div>
                )}
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              
              <ListGroup variant="flush" className="mb-3">
                {basketItems.map(item => (
                  <ListGroup.Item key={item.PID} className="d-flex justify-content-between">
                    <div>
                      <div>{item.PName}</div>
                      <small className="text-muted">Qty: {item.Quantity}</small>
                    </div>
                    <div>${(item.PriceSold * item.Quantity).toFixed(2)}</div>
                  </ListGroup.Item>
                ))}
                
                <ListGroup.Item className="d-flex justify-content-between fw-bold">
                  <div>Total</div>
                  <div>${calculateTotal().toFixed(2)}</div>
                </ListGroup.Item>
              </ListGroup>
              
              <Button 
                variant="primary" 
                size="lg" 
                className="w-100"
                onClick={handleSubmit}
                disabled={
                  (formData.paymentMethod === 'saved' && !formData.savedCardId) ||
                  !formData.shippingAddressId ||
                  success
                }
              >
                Place Order
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Checkout;
