import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Badge, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { formatPrice } from '../utils/utilities';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    searchTerm: ''
  });
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Build query parameters for filtering
        const params = new URLSearchParams();
        if (filter.category) params.append('type', filter.category);
        if (filter.minPrice) params.append('minPrice', filter.minPrice);
        if (filter.maxPrice) params.append('maxPrice', filter.maxPrice);
        if (filter.searchTerm) params.append('search', filter.searchTerm);
        
        // Fetch products from the backend API
        const response = await axios.get(`http://localhost:3001/api/products?${params.toString()}`);
        setProducts(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [filter]); // Re-fetch when filters change
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const addToBasket = async (productId) => {
    try {
      if (!isAuthenticated) {
        // Redirect to login if user is not authenticated
        navigate('/login');
        return;
      }
      
      // Add the product to the basket via API
      await axios.post('http://localhost:3001/api/basket/items', {
        productId,
        quantity: 1 // Default quantity
      });
      
      // Show success message
      setSuccessMessage(`Product added to your basket!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error adding to basket:', err);
      setError('Failed to add product to basket. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };
  
  // Get unique categories from the product data
  const uniqueCategories = [...new Set(products.map(product => product.PType))];
  
  if (loading) {
    return <div className="text-center my-5">Loading products...</div>;
  }
  
  return (
    <div>
      <h2 className="mb-4">Products</h2>
      
      {/* Display success message */}
      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
          {successMessage}
        </Alert>
      )}
      
      {/* Display error message */}
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}
      
      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Filter Products</Card.Title>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select 
                  name="category" 
                  value={filter.category}
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  {uniqueCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Min Price</Form.Label>
                <Form.Control
                  type="number"
                  name="minPrice"
                  placeholder="Min $"
                  value={filter.minPrice}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Max Price</Form.Label>
                <Form.Control
                  type="number"
                  name="maxPrice"
                  placeholder="Max $"
                  value={filter.maxPrice}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  name="searchTerm"
                  placeholder="Search products..."
                  value={filter.searchTerm}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Product List */}
      {products.length === 0 ? (
        <div className="alert alert-info">No products match your filters.</div>
      ) : (
        <Row>
          {products.map(product => (
            <Col key={product.PID} lg={4} md={6} sm={12} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>{product.PName}</Card.Title>
                  <Badge bg="secondary" className="mb-2">{product.PType}</Badge>
                  
                  {product.OnOffer ? (
                    <div className="mb-2">
                      <span className="text-decoration-line-through text-muted me-2">
                        ${formatPrice(product.PPrice)}
                      </span>
                      <span className="fw-bold text-danger">
                        ${formatPrice(product.OfferPrice)}
                      </span>
                      <Badge bg="success" className="ms-2">Special Offer</Badge>
                    </div>
                  ) : (
                    <Card.Text className="mb-2">
                      ${formatPrice(product.PPrice)}
                    </Card.Text>
                  )}
                  
                  <Card.Text className="text-truncate mb-3">
                    {product.PDescription}
                  </Card.Text>
                  
                  <div className="d-flex justify-content-between">
                    <Button 
                      as={Link} 
                      to={`/products/${product.PID}`}
                      variant="outline-primary"
                    >
                      View Details
                    </Button>
                    
                    <Button 
                      variant="primary"
                      onClick={() => addToBasket(product.PID)}
                      disabled={product.PQuantity < 1}
                    >
                      {product.PQuantity < 1 ? 'Out of Stock' : 'Add to Basket'}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default ProductList;