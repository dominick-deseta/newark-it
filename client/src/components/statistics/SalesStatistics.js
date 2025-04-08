import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Button, Row, Col, Tabs, Tab, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { formatPrice, formatDate } from '../utils/utilities';

const SalesStatistics = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
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
  
  useEffect(() => {
    // Check if user is authorized to view statistics (only gold and platinum users)
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // if (user does not have priveleges to view) {
    //   navigate('/');
    //   return;
    // }
    
    // Load initial data based on active tab
    if (activeTab === 'creditCards') {
      fetchCreditCardStats();
    } else if (activeTab === 'bestCustomers') {
      fetchBestCustomers();
    }
  }, [isAuthenticated, user, navigate, activeTab]);
  
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
      
      // Fetch credit card statistics from the backend
      const response = await axios.get('http://localhost:3001/api/statistics/credit-cards');
      setCreditCardStats(response.data);
      
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
      
      // Fetch best customers from the backend
      const response = await axios.get('http://localhost:3001/api/statistics/best-customers');
      setBestCustomers(response.data);
      
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
      
      // Prepare query params
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };
      
      // Fetch all date-range-based statistics in parallel
      const [topProductsResponse, popularProductsResponse, basketTotalsResponse, productTypeAvgResponse] = await Promise.all([
        axios.get('http://localhost:3001/api/statistics/top-products', { params }),
        axios.get('http://localhost:3001/api/statistics/popular-products', { params }),
        axios.get('http://localhost:3001/api/statistics/basket-totals', { params }),
        axios.get('http://localhost:3001/api/statistics/product-type-avg', { params })
      ]);
      
      setTopProducts(topProductsResponse.data);
      setPopularProducts(popularProductsResponse.data);
      setBasketTotals(basketTotalsResponse.data);
      setProductTypeAvg(productTypeAvgResponse.data);
      
      setError('');
    } catch (err) {
      console.error('Error fetching date-based statistics:', err);
      setError('Failed to load statistics for the selected date range.');
    } finally {
      setLoading(false);
    }
  };
  
  // Check if user is authorized to view statistics
  if (!isAuthenticated) {
    return (
      <Alert variant="warning">
        Please log in to view sales statistics.
        <div className="mt-3">
          <Button onClick={() => navigate('/login')} variant="primary">
            Login
          </Button>
        </div>
      </Alert>
    );
  }
  
  // if (user && !['gold', 'platinum'].includes(user.status)) {
  //   return (
  //     <Alert variant="warning">
  //       You need to have Gold or Platinum status to access sales statistics.
  //       <div className="mt-3">
  //         <Button onClick={() => navigate('/')} variant="primary">
  //           Return to Home
  //         </Button>
  //       </div>
  //     </Alert>
  //   );
  // }
  
  return (
    <div>
      <h2 className="mb-4">Sales Statistics</h2>
      
      {error && (
        <Alert variant="danger" className="mb-4" onClose={() => setError('')} dismissible>
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
                          <td>${formatPrice(card.totalAmount)}</td>
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
                          <td>${formatPrice(customer.totalSpent)}</td>
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
                                <td>${formatPrice(product.revenue)}</td>
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
                                <td>${formatPrice(item.maxAmount)}</td>
                                <td>{formatDate(item.date)}</td>
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
                                <td>${formatPrice(item.avgPrice)}</td>
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