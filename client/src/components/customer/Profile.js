import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CustomerProfile = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    phone: '',
    status: 'regular',
    creditLine: null
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would fetch from your API
        // const response = await axios.get('http://localhost:3001/api/customers/profile');
        
        // Mock data for development
        setProfile({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          address: '123 Main St, New York, NY 10001',
          phone: '(555) 123-4567',
          status: 'gold',
          creditLine: 500.00
        });
        
        setError('');
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load your profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // In a real app, you would call your API
      // await axios.put('http://localhost:3001/api/customers/profile', {
      //   firstName: profile.firstName,
      //   lastName: profile.lastName,
      //   address: profile.address,
      //   phone: profile.phone
      // });
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update your profile. Please try again.');
    }
  };
  
  const getStatusBadge = (status) => {
    let badgeColor = 'secondary';
    
    switch (status) {
      case 'silver':
        badgeColor = 'secondary';
        break;
      case 'gold':
        badgeColor = 'warning';
        break;
      case 'platinum':
        badgeColor = 'light';
        break;
      default:
        badgeColor = 'secondary';
    }
    
    return <Badge bg={badgeColor} className="text-capitalize">{status}</Badge>;
  };
  
  if (loading) {
    return <div className="text-center my-5">Loading your profile...</div>;
  }
  
  return (
    <div>
      <h2 className="mb-4">My Profile</h2>
      
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
            <Card.Title>Personal Information</Card.Title>
            <Button 
              variant={isEditing ? "secondary" : "primary"} 
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
          
          {isEditing ? (
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={profile.email}
                  disabled
                />
                <Form.Text className="text-muted">
                  Email cannot be changed. Please contact support if you need to update your email.
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={profile.address}
                  onChange={handleInputChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                />
              </Form.Group>
              
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </Form>
          ) : (
            <div>
              <Row className="mb-2">
                <Col md={3} className="fw-bold">Name:</Col>
                <Col md={9}>{profile.firstName} {profile.lastName}</Col>
              </Row>
              
              <Row className="mb-2">
                <Col md={3} className="fw-bold">Email:</Col>
                <Col md={9}>{profile.email}</Col>
              </Row>
              
              <Row className="mb-2">
                <Col md={3} className="fw-bold">Address:</Col>
                <Col md={9}>{profile.address}</Col>
              </Row>
              
              <Row className="mb-2">
                <Col md={3} className="fw-bold">Phone:</Col>
                <Col md={9}>{profile.phone}</Col>
              </Row>
              
              <Row className="mb-2">
                <Col md={3} className="fw-bold">Status:</Col>
                <Col md={9}>{getStatusBadge(profile.status)}</Col>
              </Row>
              
              {profile.creditLine !== null && (
                <Row className="mb-2">
                  <Col md={3} className="fw-bold">Credit Line:</Col>
                  <Col md={9}>${profile.creditLine.toFixed(2)}</Col>
                </Row>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
      
      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Credit Cards</Card.Title>
              <Card.Text>
                Manage your saved credit cards for faster checkout.
              </Card.Text>
              <Button as={Link} to="/profile/credit-card" variant="outline-primary">
                Manage Credit Cards
              </Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Shipping Addresses</Card.Title>
              <Card.Text>
                Manage your shipping addresses for convenient delivery.
              </Card.Text>
              <Button as={Link} to="/profile/shipping-address" variant="outline-primary">
                Manage Shipping Addresses
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card>
        <Card.Body>
          <Card.Title>Order History</Card.Title>
          <Card.Text>
            View your past orders and track current deliveries.
          </Card.Text>
          <Button as={Link} to="/orders" variant="outline-primary">
            View Order History
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CustomerProfile;