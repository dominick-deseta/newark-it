import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, ListGroup, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { formatPrice } from '../utils/utilities';

const Checkout = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [basket, setBasket] = useState({ basketId: null, items: [], total: 0 });
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
  
  // Fetch necessary data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const fetchCheckoutData = async () => {
      try {
        setLoading(true);
        
        // Fetch basket
        const basketResponse = await axios.get('http://localhost:3001/api/basket');
        setBasket(basketResponse.data);
        
        // Fetch shipping addresses
        const addressesResponse = await axios.get('http://localhost:3001/api/customers/shipping-addresses');
        setShippingAddresses(addressesResponse.data);
        
        // Fetch credit cards
        const cardsResponse = await axios.get('http://localhost:3001/api/customers/credit-cards');
        setSavedCreditCards(cardsResponse.data);
        
        // Set default values for form if data is available
        if (addressesResponse.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            shippingAddressId: addressesResponse.data[0].id
          }));
        }
        
        if (cardsResponse.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            savedCardId: cardsResponse.data[0].id
          }));
        } else {
          // If no saved cards, default to new card
          setFormData(prev => ({
            ...prev,
            paymentMethod: 'new'
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
  }, [isAuthenticated, navigate]);
  
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare transaction data
      const transactionData = {
        shippingAddressId: formData.shippingAddressId,
        paymentMethod: formData.paymentMethod,
        savedCardId: formData.paymentMethod === 'saved' ? formData.savedCardId : null,
        newCard: formData.paymentMethod === 'new' ? {
          cardNumber: formData.newCard.cardNumber,
          securityCode: formData.newCard.securityCode,
          ownerName: formData.newCard.ownerName,
          cardType: formData.newCard.cardType,
          billingAddress: formData.newCard.billingAddress,
          expiryDate: formData.newCard.expiryDate,
          saveCard: formData.saveNewCard
        } : null
      };
      
      // Submit the order to the backend
      await axios.post('http://localhost:3001/api/transactions', transactionData);
      
      // Show success message
      setSuccess(true);
      
      // Redirect to order confirmation after a delay
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
    } catch (err) {
      console.error('Error submitting order:', err);
      setError('Failed to submit your order. Please try again.');
    }
  };
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Alert variant="warning">Please log in to proceed with checkout.</Alert>;
  }
  
  if (loading) {
    return <div className="text-center my-5">Loading checkout information...</div>;
  }
  
  if (basket.items?.length === 0) {
    return (
      <Alert variant="warning">
        Your basket is empty. Please add items to your basket before checkout.
        <div className="mt-3">
          <Button as={Link} to="/products" variant="primary">
            Browse Products
          </Button>
        </div>
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
        <Alert variant="danger" onClose={() => setError('')} dismissible>
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
                  <div className="mt-3">
                    <Button as={Link} to="/profile/shipping-address" variant="primary">
                      Add Shipping Address
                    </Button>
                  </div>
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
                        {address.name} - {address.recipientName}, {address.streetNumber} {address.street}, {address.city}, {address.state} {address.zipCode}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
              
              <div className="text-end">
                <Button variant="outline-primary" size="sm" onClick={() => navigate('/profile/shipping-address')}>
                  Manage Addresses
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
                        {card.cardType} ending in {card.cardNumber.slice(-4)} (Expires: {card.expiryDate})
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
                {basket.items?.map(item => (
                  <ListGroup.Item key={item.PID} className="d-flex justify-content-between">
                    <div>
                      <div>{item.PName}</div>
                      <small className="text-muted">Qty: {item.Quantity}</small>
                    </div>
                    <div>${formatPrice(item.PriceSold * item.Quantity)}</div>
                  </ListGroup.Item>
                ))}
                
                <ListGroup.Item className="d-flex justify-content-between fw-bold">
                  <div>Total</div>
                  <div>${formatPrice(basket.total)}</div>
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
                  success ||
                  shippingAddresses.length === 0
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