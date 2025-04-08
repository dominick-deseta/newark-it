import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Table, Alert, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const ShippingAddressForm = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  
  const [formData, setFormData] = useState({
    addressName: '',
    recipientName: '',
    street: '',
    streetNumber: '',
    city: '',
    zipCode: '',
    state: '',
    country: ''
  });
  
  // Fetch user's shipping addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        
        // Fetch shipping addresses from the backend
        const response = await axios.get('http://localhost:3001/api/customers/shipping-addresses');
        setAddresses(response.data);
        
        setError('');
      } catch (err) {
        console.error('Error fetching shipping addresses:', err);
        setError('Failed to load your shipping addresses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAddresses();
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
      addressName: '',
      recipientName: '',
      street: '',
      streetNumber: '',
      city: '',
      zipCode: '',
      state: '',
      country: ''
    });
    setEditing(null);
  };
  
  const validateForm = () => {
    // Basic validation
    for (const key in formData) {
      if (!formData[key]) {
        setError('All fields are required');
        return false;
      }
    }
    
    // Validate address name uniqueness if not editing
    if (!editing && addresses.some(address => address.name === formData.addressName)) {
      setError('Address name must be unique');
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
      if (editing) {
        // Editing existing address
        await axios.put(`http://localhost:3001/api/customers/shipping-addresses/${editing}`, {
          recipientName: formData.recipientName,
          street: formData.street,
          streetNumber: formData.streetNumber,
          city: formData.city,
          zipCode: formData.zipCode,
          state: formData.state,
          country: formData.country
        });
        
        // Update state
        setAddresses(prevAddresses => 
          prevAddresses.map(address => 
            address.id === editing ? 
            {
              ...address,
              recipientName: formData.recipientName,
              street: formData.street,
              streetNumber: formData.streetNumber,
              city: formData.city,
              zipCode: formData.zipCode,
              state: formData.state,
              country: formData.country
            } : address
          )
        );
        
        setSuccess('Shipping address updated successfully!');
      } else {
        // Adding new address
        await axios.post('http://localhost:3001/api/customers/shipping-addresses', {
          addressName: formData.addressName,
          recipientName: formData.recipientName,
          street: formData.street,
          streetNumber: formData.streetNumber,
          city: formData.city,
          zipCode: formData.zipCode,
          state: formData.state,
          country: formData.country
        });
        
        // Fetch updated address list
        const response = await axios.get('http://localhost:3001/api/customers/shipping-addresses');
        setAddresses(response.data);
        
        setSuccess('Shipping address added successfully!');
      }
      
      // Reset form and UI state
      resetForm();
      setShowForm(false);
      setError('');
    } catch (err) {
      console.error('Error saving shipping address:', err);
      setError('Failed to save shipping address. Please try again.');
    }
  };
  
  const handleEdit = (id) => {
    const addressToEdit = addresses.find(address => address.id === id);
    if (addressToEdit) {
      setFormData({
        addressName: addressToEdit.name,
        recipientName: addressToEdit.recipientName,
        street: addressToEdit.street,
        streetNumber: addressToEdit.streetNumber,
        city: addressToEdit.city,
        zipCode: addressToEdit.zipCode,
        state: addressToEdit.state,
        country: addressToEdit.country
      });
      
      setEditing(id);
      setShowForm(true);
      setError('');
    }
  };
  
  const handleDelete = async (id) => {
    try {
      // Delete the shipping address from the backend
      await axios.delete(`http://localhost:3001/api/customers/shipping-addresses/${id}`);
      
      // Update state
      setAddresses(prev => prev.filter(address => address.id !== id));
      
      setSuccess('Shipping address removed successfully!');
      
      // If currently editing the deleted address, reset form
      if (editing === id) {
        resetForm();
        setShowForm(false);
      }
    } catch (err) {
      console.error('Error deleting shipping address:', err);
      setError('Failed to remove shipping address. Please try again.');
    }
  };
  
  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };
  
  if (loading) {
    return <div className="text-center my-5">Loading your shipping addresses...</div>;
  }
  
  return (
    <div>
      <h2 className="mb-4">Manage Shipping Addresses</h2>
      
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
            <Card.Title>Your Shipping Addresses</Card.Title>
            <Button 
              variant="primary" 
              onClick={() => {
                if (!showForm) {
                  resetForm();
                  setShowForm(true);
                } else {
                  setShowForm(false);
                }
              }}
            >
              {showForm ? 'Cancel' : 'Add New Address'}
            </Button>
          </div>
          
          {addresses.length === 0 ? (
            <Alert variant="info">
              You don't have any saved shipping addresses yet.
            </Alert>
          ) : (
            <Table responsive>
              <thead>
                <tr>
                  <th>Address Name</th>
                  <th>Recipient</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {addresses.map(address => (
                  <tr key={address.id}>
                    <td>{address.name}</td>
                    <td>{address.recipientName}</td>
                    <td>
                      {address.streetNumber} {address.street}, {address.city}, {address.state} {address.zipCode}, {address.country}
                    </td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(address.id)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDelete(address.id)}
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
            <Card.Title>{editing ? 'Edit Shipping Address' : 'Add New Shipping Address'}</Card.Title>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Address Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="addressName"
                      value={formData.addressName}
                      onChange={handleInputChange}
                      placeholder="e.g., Home, Office, etc."
                      disabled={editing !== null} // Can't change address name when editing
                    />
                    <Form.Text className="text-muted">
                      This is for your reference to identify this address.
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Recipient Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleInputChange}
                      placeholder="Full name of recipient"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Street</Form.Label>
                    <Form.Control
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="Street name"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Street Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="streetNumber"
                      value={formData.streetNumber}
                      onChange={handleInputChange}
                      placeholder="Street number"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>ZIP/Postal Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="ZIP or Postal code"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>State/Province</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State or Province"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Country name"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex">
                <Button variant="secondary" type="button" onClick={handleCancel} className="me-2">
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {editing ? 'Update Address' : 'Save Address'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default ShippingAddressForm;