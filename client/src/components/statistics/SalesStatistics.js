import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Button, Row, Col, Tabs, Tab, Alert } from 'react-bootstrap';
import axios from 'axios';

const SalesStatistics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('creditCards');
  
  // Date range for filtering
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  // Statistics data
  const [creditCardStats, setCreditCardStats] = useState([]);
  const [bestCustomers, setBestCustomers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [basketTotals, setBasketTotals] = useState([]);
  const [productTypeAvg, setProductTypeAvg] = useState([]);
  
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const fetchCreditCardStats = async () => {
    try {
      setLoading(true);
      // In a real app, you would fetch from your API
      // const response = await axios.get('http://localhost:3001/api/statistics/credit-cards');
      
      // Mock data for development
      setCreditCardStats([
        { cardNumber: '****1234', cardType: 'Visa', totalAmount: 5299.97 },
        { cardNumber: '****5678', cardType: 'Mastercard', totalAmount: 3499.95 },
        { cardNumber: '****9012', cardType: 'Amex', totalAmount: 2199.98 }
      ]);
      
      setError('');
    } catch (err) {
      console.error('Error fetching credit card stats:', err);
      setError('Failed to load credit card statistics.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchBestCustomers = async () => {
    try {
      setLoading(true);
      // In a real app, you would fetch from your API
      // const response = await axios.get('http://localhost:3001/api/statistics/best-customers');
      
      // Mock data for development
      setBestCustomers([
        { id: 1, name: 'John Smith', email: 'john@example.com', totalSpent: 7999.95, orderCount: 12 },
        { id: 2, name: 'Emily Johnson', email: 'emily@example.com', totalSpent: 5499.90, orderCount: 8 },
        { id: 3, name: 'Michael Brown', email: 'michael@example.com', totalSpent: 4299.97, orderCount: 7 },
        { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', totalSpent: 3799.80, orderCount: 5 },
        { id: 5, name: 'David Lee', email: 'david@example.com', totalSpent: 2899.95, orderCount: 4 },
        { id: 6, name: 'Jessica Chen', email: 'jessica@example.com', totalSpent: 2599.99, orderCount: 3 },
        { id: 7, name: 'Kevin Wang', email: 'kevin@example.com', totalSpent: 1999.97, orderCount: 2 },
        { id: 8, name: 'Jennifer Martinez', email: 'jennifer@example.com', totalSpent: 1799.99, orderCount: 2 },
        { id: 9, name: 'Daniel Garcia', email: 'daniel@example.com', totalSpent: 1499.95, orderCount: 1 },
        { id: 10, name: 'Laura Taylor', email: 'laura@example.com', totalSpent: 1299.99, orderCount: 1 }
      ]);
      
      setError('');
    } catch (err) {
      console.error('Error fetching best customers:', err);
      setError('Failed to load best customers statistics.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStatisticsByDateRange = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setError('Please select both start and end dates.');
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app, you would fetch from your API with date params
      // const params = {
      //   startDate: dateRange.startDate,
      //   endDate: dateRange.endDate
      // };
      
      // const topProductsResponse = await axios.get('http://localhost:3001/api/statistics/top-products', { params });
      // const popularProductsResponse = await axios.get('http://localhost:3001/api/statistics/popular-products', { params });
      // const basketTotalsResponse = await axios.get('http://localhost:3001/api/statistics/basket-totals', { params });
      // const productTypeAvgResponse = await axios.get('http://localhost:3001/api/statistics/product-type-avg', { params });
      
      // Mock data for development
      setTopProducts([
        { pid: 1, name: 'Dell XPS 13', type: 'laptop', quantity: 45, revenue: 58499.55 },
        { pid: 3, name: 'HP LaserJet Pro', type: 'printer', quantity: 38, revenue: 13299.62 },
        { pid: 2, name: 'Apple MacBook Pro', type: 'laptop', quantity: 32, revenue: 63999.68 }
      ]);
      
      setPopularProducts([
        { pid: 1, name: 'Dell XPS 13', type: 'laptop', distinctCustomers: 42 },
        { pid: 5, name: 'Logitech MX Master', type: 'accessory', distinctCustomers: 37 },
        { pid: 3, name: 'HP LaserJet Pro', type: 'printer', distinctCustomers: 32 }
      ]);
      
      setBasketTotals([
        { cardNumber: '****1234', cardType: 'Visa', maxAmount: 3499.95, date: '2023-11-15' },
        { cardNumber: '****5678', cardType: 'Mastercard', maxAmount: 2899.90, date: '2023-11-22' },
        { cardNumber: '****9012', cardType: 'Amex', maxAmount: 4599.97, date: '2023-11-10' }
      ]);
      
      setProductTypeAvg([
        { type: 'desktop', avgPrice: 1299.99 },
        { type: 'laptop', avgPrice: 1799.95 },
        { type: 'printer', avgPrice: 349.99 }
      ]);
      
      setError('');
    } catch (err) {
      console.error('Error fetching date-based statistics:', err);
      setError('Failed to load statistics for the selected date range.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (activeTab === 'creditCards') {
      fetchCreditCardStats();
    } else if (activeTab === 'bestCustomers') {
      fetchBestCustomers();
    }
  }, [activeTab]);
  
  return (
    <div>
      <h2 className="mb-4">Sales Statistics</h2>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="creditCards" title="Credit Card Stats">
          <Card>
            <Card.Body>
              <Card.Title>Total Amount Charged Per Credit Card</Card.Title>
              {loading ? (
                <div className="text-center py-3">Loading data...</div>
              ) : (
                <Table striped bordered responsive>
                  <thead>
                    <tr>
                      <th>Card Number</th>
                      <th>Card Type</th>
                      <th>Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creditCardStats.length > 0 ? (
                      creditCardStats.map((card, index) => (
                        <tr key={index}>
                          <td>{card.cardNumber}</td>
                          <td>{card.cardType}</td>
                          <td>${card.totalAmount.toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center">No data available</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="bestCustomers" title="Best Customers">
          <Card>
            <Card.Body>
              <Card.Title>Top 10 Customers by Spending</Card.Title>
              {loading ? (
                <div className="text-center py-3">Loading data...</div>
              ) : (
                <Table striped bordered responsive>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Customer Name</th>
                      <th>Email</th>
                      <th>Total Spent</th>
                      <th>Order Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bestCustomers.length > 0 ? (
                      bestCustomers.map((customer, index) => (
                        <tr key={customer.id}>
                          <td>{index + 1}</td>
                          <td>{customer.name}</td>
                          <td>{customer.email}</td>
                          <td>${customer.totalSpent.toFixed(2)}</td>
                          <td>{customer.orderCount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">No data available</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="dateRangeStats" title="Date Range Statistics">
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Select Date Range</Card.Title>
              <Row className="mb-3">
                <Col md={5}>
                  <Form.Group>
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      value={dateRange.startDate}
                      onChange={handleDateChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group>
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="endDate"
                      value={dateRange.endDate}
                      onChange={handleDateChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button 
                    variant="primary" 
                    onClick={fetchStatisticsByDateRange}
                    disabled={loading || !dateRange.startDate || !dateRange.endDate}
                    className="w-100"
                  >
                    {loading ? 'Loading...' : 'Generate'}
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          {loading ? (
            <div className="text-center py-3">Loading statistics...</div>
          ) : (
            <>
              <Row>
                <Col md={6} className="mb-4">
                  <Card className="h-100">
                    <Card.Body>
                      <Card.Title>Most Frequently Sold Products</Card.Title>
                      <Table striped bordered responsive>
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Type</th>
                            <th>Quantity Sold</th>
                            <th>Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topProducts.length > 0 ? (
                            topProducts.map(product => (
                              <tr key={product.pid}>
                                <td>{product.name}</td>
                                <td>{product.type}</td>
                                <td>{product.quantity}</td>
                                <td>${product.revenue.toFixed(2)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="text-center">No data available</td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={6} className="mb-4">
                  <Card className="h-100">
                    <Card.Body>
                      <Card.Title>Products with Highest Number of Distinct Customers</Card.Title>
                      <Table striped bordered responsive>
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Type</th>
                            <th>Distinct Customers</th>
                          </tr>
                        </thead>
                        <tbody>
                          {popularProducts.length > 0 ? (
                            popularProducts.map(product => (
                              <tr key={product.pid}>
                                <td>{product.name}</td>
                                <td>{product.type}</td>
                                <td>{product.distinctCustomers}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="text-center">No data available</td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              <Row>
                <Col md={6} className="mb-4">
                  <Card className="h-100">
                    <Card.Body>
                      <Card.Title>Maximum Basket Total per Credit Card</Card.Title>
                      <Table striped bordered responsive>
                        <thead>
                          <tr>
                            <th>Card Number</th>
                            <th>Card Type</th>
                            <th>Max Amount</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {basketTotals.length > 0 ? (
                            basketTotals.map((item, index) => (
                              <tr key={index}>
                                <td>{item.cardNumber}</td>
                                <td>{item.cardType}</td>
                                <td>${item.maxAmount.toFixed(2)}</td>
                                <td>{item.date}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="text-center">No data available</td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={6} className="mb-4">
                  <Card className="h-100">
                    <Card.Body>
                      <Card.Title>Average Selling Price per Product Type</Card.Title>
                      <Table striped bordered responsive>
                        <thead>
                          <tr>
                            <th>Product Type</th>
                            <th>Average Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productTypeAvg.length > 0 ? (
                            productTypeAvg.map((item, index) => (
                              <tr key={index}>
                                <td>{item.type}</td>
                                <td>${item.avgPrice.toFixed(2)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="2" className="text-center">No data available</td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default SalesStatistics;