import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, Row, Col, Accordion, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { formatPrice, formatDate } from '../utils/utilities';

const OrderHistory = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter state
  const [filter, setFilter] = useState({
    productName: '',
    startDate: '',
    endDate: ''
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        
        // Fetch transaction history from the backend
        const response = await axios.get('http://localhost:3001/api/transactions');
        setTransactions(response.data);
        
        setError('');
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [isAuthenticated, navigate]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const applyFilters = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filter.productName) {
        params.append('productName', filter.productName);
      }
      
      if (filter.startDate) {
        params.append('startDate', filter.startDate);
      }
      
      if (filter.endDate) {
        params.append('endDate', filter.endDate);
      }
      
      // Fetch filtered transactions from the backend
      const response = await axios.get(`http://localhost:3001/api/transactions/filter?${params.toString()}`);
      setTransactions(response.data);
      
      setError('');
    } catch (err) {
      console.error('Error filtering orders:', err);
      setError('Failed to filter orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const resetFilters = async () => {
    setFilter({
      productName: '',
      startDate: '',
      endDate: ''
    });
    
    try {
      setLoading(true);
      
      // Fetch all transactions again
      const response = await axios.get('http://localhost:3001/api/transactions');
      setTransactions(response.data);
      
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to reset filters. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadge = (status) => {
    return status === 'delivered' ? 
      <Badge bg="success">Delivered</Badge> : 
      <Badge bg="danger">Not Delivered</Badge>;
  };
  
  if (!isAuthenticated) {
    return (
      <Alert variant="warning">
        Please log in to view your order history.
        <div className="mt-3">
          <Button as={Link} to="/login" variant="primary">
            Login
          </Button>
        </div>
      </Alert>
    );
  }
  
  if (loading) {
    return <div className="text-center my-5">Loading your orders...</div>;
  }
  
  return (
    <div>
      <h2 className="mb-4">Order History</h2>
      
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}
      
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Filter Orders</Card.Title>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Product Name</Form.Label>
                <Form.Control
                  type="text"
                  name="productName"
                  value={filter.productName}
                  onChange={handleFilterChange}
                  placeholder="Search by product name"
                />
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={filter.startDate}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={filter.endDate}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            
            <Col md={2} className="d-flex align-items-end">
              <div className="d-grid gap-2 w-100 mb-3">
                <Button variant="primary" onClick={applyFilters}>
                  Apply Filters
                </Button>
                <Button variant="outline-secondary" onClick={resetFilters}>
                  Reset
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {transactions.length === 0 ? (
        <Alert variant="info">
          {filter.productName || filter.startDate || filter.endDate ?
            'No orders match your filter criteria.' :
            'You have no orders yet.'}
        </Alert>
      ) : (
        <Accordion className="mb-4">
          {transactions.map((transaction) => (
            <Accordion.Item key={transaction.BID} eventKey={`${transaction.BID}`}>
              <Accordion.Header>
                <div className="d-flex w-100 justify-content-between align-items-center">
                  <div>
                    <strong>Order #{transaction.BID}</strong> - {formatDate(transaction.TDate)}
                  </div>
                  <div className="me-3">
                    {getStatusBadge(transaction.TTag)}
                    <span className="ms-3">${transaction.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <Row>
                  <Col md={6}>
                    <h6>Order Details</h6>
                    <p>
                      <strong>Date:</strong> {formatDate(transaction.TDate)}<br />
                      <strong>Status:</strong> {getStatusBadge(transaction.TTag)}<br />
                      <strong>Payment:</strong> Credit Card {transaction.MaskedCCNumber}
                    </p>
                  </Col>
                  <Col md={6}>
                    <h6>Shipping Address</h6>
                    <p>
                      {transaction.RecipientName}<br />
                      {transaction.SNumber} {transaction.Street}<br />
                      {transaction.City}, {transaction.State} {transaction.Zip}<br />
                      {transaction.Country}
                    </p>
                  </Col>
                </Row>
                
                <h6>Items</h6>
                <Table responsive striped bordered hover>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaction.items.map(item => (
                      <tr key={item.PID}>
                        <td>
                          <Link to={`/products/${item.PID}`}>
                            {item.PName}
                          </Link>
                        </td>
                        <td>{item.PType}</td>
                        <td>${formatPrice(item.PriceSold)}</td>
                        <td>{item.Quantity}</td>
                        <td>${formatPrice(item.PriceSold * item.Quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="4" className="text-end fw-bold">Total:</td>
                      <td className="fw-bold">${formatPrice(transaction.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </Table>
                
                <div className="text-end">
                  <Button as={Link} to={`/orders/${transaction.BID}`} variant="outline-primary">
                    View Details
                  </Button>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default OrderHistory;