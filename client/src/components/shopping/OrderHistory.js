import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, Row, Col, Accordion, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter state
  const [filter, setFilter] = useState({
    productName: '',
    startDate: '',
    endDate: ''
  });
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would fetch from your API
        // const response = await axios.get('http://localhost:3001/api/transactions');
        
        // Mock data for development
        const mockOrders = [
          {
            BID: 1,
            MaskedCCNumber: '****4242',
            SAName: 'Home',
            TDate: '2023-11-15T10:30:00',
            TTag: 'delivered',
            RecipientName: 'John Doe',
            Street: 'Main St',
            SNumber: '123',
            City: 'New York',
            Zip: '10001',
            State: 'NY',
            Country: 'USA',
            items: [
              {
                PID: 1,
                PName: 'Dell XPS 13',
                PType: 'laptop',
                Quantity: 1,
                PriceSold: 1299.99
              }
            ],
            totalAmount: 1299.99,
            itemCount: 1
          },
          {
            BID: 2,
            MaskedCCNumber: '****1234',
            SAName: 'Office',
            TDate: '2023-11-10T14:45:00',
            TTag: 'not-delivered',
            RecipientName: 'John Doe',
            Street: 'Business Ave',
            SNumber: '456',
            City: 'Newark',
            Zip: '07102',
            State: 'NJ',
            Country: 'USA',
            items: [
              {
                PID: 3,
                PName: 'HP LaserJet Pro',
                PType: 'printer',
                Quantity: 1,
                PriceSold: 349.99
              },
              {
                PID: 5,
                PName: 'Logitech MX Master',
                PType: 'accessory',
                Quantity: 2,
                PriceSold: 99.99
              }
            ],
            totalAmount: 549.97,
            itemCount: 2
          },
          {
            BID: 3,
            MaskedCCNumber: '****5678',
            SAName: 'Home',
            TDate: '2023-10-25T11:15:00',
            TTag: 'delivered',
            RecipientName: 'John Doe',
            Street: 'Main St',
            SNumber: '123',
            City: 'New York',
            Zip: '10001',
            State: 'NY',
            Country: 'USA',
            items: [
              {
                PID: 2,
                PName: 'Apple MacBook Pro',
                PType: 'laptop',
                Quantity: 1,
                PriceSold: 1999.99
              },
              {
                PID: 4,
                PName: 'Samsung Monitor',
                PType: 'accessory',
                Quantity: 1,
                PriceSold: 299.99
              }
            ],
            totalAmount: 2299.98,
            itemCount: 2
          }
        ];
        
        setOrders(mockOrders);
        setError('');
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
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
      
      // In a real app, you would call your API with filters
      // let url = 'http://localhost:3001/api/transactions/filter?';
      // const params = new URLSearchParams();
      // 
      // if (filter.productName) {
      //   params.append('productName', filter.productName);
      // }
      // 
      // if (filter.startDate) {
      //   params.append('startDate', filter.startDate);
      // }
      // 
      // if (filter.endDate) {
      //   params.append('endDate', filter.endDate);
      // }
      // 
      // const response = await axios.get(url + params.toString());
      // setOrders(response.data);
      
      // Mock filtered data for development
      const mockFilteredOrders = [...orders].filter(order => {
        // Filter by product name
        if (filter.productName) {
          const hasMatchingProduct = order.items.some(item => 
            item.PName.toLowerCase().includes(filter.productName.toLowerCase())
          );
          if (!hasMatchingProduct) return false;
        }
        
        // Filter by date range
        const orderDate = new Date(order.TDate);
        if (filter.startDate) {
          const startDate = new Date(filter.startDate);
          if (orderDate < startDate) return false;
        }
        
        if (filter.endDate) {
          const endDate = new Date(filter.endDate);
          // Set end date to end of day
          endDate.setHours(23, 59, 59, 999);
          if (orderDate > endDate) return false;
        }
        
        return true;
      });
      
      setOrders(mockFilteredOrders);
      setError('');
    } catch (err) {
      console.error('Error filtering orders:', err);
      setError('Failed to filter orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const resetFilters = () => {
    setFilter({
      productName: '',
      startDate: '',
      endDate: ''
    });
    
    // Re-fetch all orders
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would fetch from your API
        // const response = await axios.get('http://localhost:3001/api/transactions');
        
        // Mock data for development - use the same data as in useEffect
        const mockOrders = [
          // ... Same mock orders as above
        ];
        
        // Since this is just a demo, we'll use a timeout to simulate API call
        setTimeout(() => {
          setOrders(mockOrders);
          setLoading(false);
        }, 500);
        
        setError('');
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchOrders();
  };
  
  const getStatusBadge = (status) => {
    return status === 'delivered' ? 
      <Badge bg="success">Delivered</Badge> : 
      <Badge bg="danger">Not Delivered</Badge>;
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return <div className="text-center my-5">Loading your orders...</div>;
  }
  
  return (
    <div>
      <h2 className="mb-4">Order History</h2>
      
      {error && (
        <Alert variant="danger" className="mb-4">
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
      
      {orders.length === 0 ? (
        <Alert variant="info">
          {filter.productName || filter.startDate || filter.endDate ?
            'No orders match your filter criteria.' :
            'You have no orders yet.'}
        </Alert>
      ) : (
        <Accordion className="mb-4">
          {orders.map((order, index) => (
            <Accordion.Item key={order.BID} eventKey={`${order.BID}`}>
              <Accordion.Header>
                <div className="d-flex w-100 justify-content-between align-items-center">
                  <div>
                    <strong>Order #{order.BID}</strong> - {formatDate(order.TDate)}
                  </div>
                  <div className="me-3">
                    {getStatusBadge(order.TTag)}
                    <span className="ms-3">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <Row>
                  <Col md={6}>
                    <h6>Order Details</h6>
                    <p>
                      <strong>Date:</strong> {formatDate(order.TDate)}<br />
                      <strong>Status:</strong> {getStatusBadge(order.TTag)}<br />
                      <strong>Payment:</strong> Credit Card {order.MaskedCCNumber}
                    </p>
                  </Col>
                  <Col md={6}>
                    <h6>Shipping Address</h6>
                    <p>
                      {order.RecipientName}<br />
                      {order.SNumber} {order.Street}<br />
                      {order.City}, {order.State} {order.Zip}<br />
                      {order.Country}
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
                    {order.items.map(item => (
                      <tr key={item.PID}>
                        <td>
                          <Link to={`/products/${item.PID}`}>
                            {item.PName}
                          </Link>
                        </td>
                        <td>{item.PType}</td>
                        <td>${item.PriceSold.toFixed(2)}</td>
                        <td>{item.Quantity}</td>
                        <td>${(item.PriceSold * item.Quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="4" className="text-end fw-bold">Total:</td>
                      <td className="fw-bold">${order.totalAmount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </Table>
                
                <div className="text-end">
                  <Button as={Link} to={`/orders/${order.BID}`} variant="outline-primary">
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