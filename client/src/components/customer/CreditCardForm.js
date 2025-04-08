import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Table, Alert } from 'react-bootstrap';
import axios from 'axios';

const CreditCardForm = () => {
  const [creditCards, setCreditCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    cardNumber: '',
    securityCode: '',
    ownerName: '',
    cardType: 'Visa',
    billingAddress: '',
    expiryMonth: '',
    expiryYear: ''
  });
  
  // Fetch user's credit cards
  useEffect(() => {
    const fetchCreditCards = async () => {
      try {
        setLoading(true);
        
        // Fetch credit cards from the backend
        const response = await axios.get('http://localhost:3001/api/customers/credit-cards');
        setCreditCards(response.data);
        
        setError('');
      } catch (err) {
        console.error('Error fetching credit cards:', err);
        setError('Failed to load your credit cards. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCreditCards();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const resetForm = () => {
    setFormData({
      cardNumber: '',
      securityCode: '',
      ownerName: '',
      cardType: 'Visa',
      billingAddress: '',
      expiryMonth: '',
      expiryYear: ''
    });
  };
  
  const validateForm = () => {
    // Basic validation - in a real app, you would want more robust validation
    if (!formData.cardNumber || !formData.securityCode || !formData.ownerName || 
        !formData.billingAddress || !formData.expiryMonth || !formData.expiryYear) {
      setError('All fields are required');
      return false;
    }
    
    // Card number should be 16 digits (simplified validation)
    if (!/^\d{16}$/.test(formData.cardNumber)) {
      setError('Card number must be 16 digits');
      return false;
    }
    
    // Security code should be 3-4 digits
    if (!/^\d{3,4}$/.test(formData.securityCode)) {
      setError('Security code must be 3 or 4 digits');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Format expiry date for API
      const expiryDate = `${formData.expiryYear}-${formData.expiryMonth}-01`;
      
      // Submit the form data to the backend
      await axios.post('http://localhost:3001/api/customers/credit-cards', {
        cardNumber: formData.cardNumber,
        securityCode: formData.securityCode,
        ownerName: formData.ownerName,
        cardType: formData.cardType,
        billingAddress: formData.billingAddress,
        expiryDate: expiryDate
      });
      
      // Fetch the updated list of credit cards
      const response = await axios.get('http://localhost:3001/api/customers/credit-cards');
      setCreditCards(response.data);
      
      // Clear form and show success message
      resetForm();
      setSuccess('Credit card added successfully!');
      setShowForm(false);
      setError('');
    } catch (err) {
      console.error('Error adding credit card:', err);
      setError('Failed to add credit card. Please try again.');
    }
  };
  
  const handleDelete = async (id) => {
    try {
      // Delete the credit card from the backend
      await axios.delete(`http://localhost:3001/api/customers/credit-cards/${id}`);
      
      // Update state to remove the deleted card
      setCreditCards(prev => prev.filter(card => card.id !== id));
      
      setSuccess('Credit card removed successfully!');
    } catch (err) {
      console.error('Error deleting credit card:', err);
      setError('Failed to remove credit card. Please try again.');
    }
  };
  
  if (loading) {
    return <div className="text-center my-5">Loading your credit cards...</div>;
  }
  
  return (
    <div>
      <h2 className="mb-4">Manage Credit Cards</h2>
      
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" onClose={() => setSuccess('')} dismissible>
          {success}
        </Alert>
      )}
      
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Card.Title>Your Credit Cards</Card.Title>
            <Button 
              variant="primary" 
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancel' : 'Add New Card'}
            </Button>
          </div>
          
          {creditCards.length === 0 ? (
            <Alert variant="info">
              You don't have any saved credit cards yet.
            </Alert>
          ) : (
            <Table responsive>
              <thead>
                <tr>
                  <th>Card Number</th>
                  <th>Name on Card</th>
                  <th>Card Type</th>
                  <th>Expiry Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {creditCards.map(card => (
                  <tr key={card.id}>
                    <td>{card.cardNumber}</td>
                    <td>{card.ownerName}</td>
                    <td>{card.cardType}</td>
                    <td>{card.expiryDate}</td>
                    <td>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDelete(card.id)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      
      {showForm && (
        <Card>
          <Card.Body>
            <Card.Title>Add New Credit Card</Card.Title>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Card Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Security Code (CVV)</Form.Label>
                    <Form.Control
                      type="text"
                      name="securityCode"
                      value={formData.securityCode}
                      onChange={handleInputChange}
                      placeholder="123"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Name on Card</Form.Label>
                <Form.Control
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Card Type</Form.Label>
                <Form.Select
                  name="cardType"
                  value={formData.cardType}
                  onChange={handleInputChange}
                >
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="Amex">American Express</option>
                  <option value="Discover">Discover</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Billing Address</Form.Label>
                <Form.Control
                  type="text"
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleInputChange}
                  placeholder="1234 Main St, City, State, Zip"
                />
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Expiry Month</Form.Label>
                    <Form.Select
                      name="expiryMonth"
                      value={formData.expiryMonth}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Month</option>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = (i + 1).toString().padStart(2, '0');
                        return (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Expiry Year</Form.Label>
                    <Form.Select
                      name="expiryYear"
                      value={formData.expiryYear}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Year</option>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = (new Date().getFullYear() + i).toString();
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Button variant="primary" type="submit">
                Save Credit Card
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default CreditCardForm;