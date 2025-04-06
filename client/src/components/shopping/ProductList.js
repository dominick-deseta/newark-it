import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    searchTerm: ''
  });
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3001/api/products');
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
  }, []);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const filteredProducts = products.filter(product => {
    // Filter by category
    if (filter.category && product.PType !== filter.category) {
      return false;
    }
    
    // Filter by price range
    if (filter.minPrice && product.PPrice < parseFloat(filter.minPrice)) {
      return false;
    }
    if (filter.maxPrice && product.PPrice > parseFloat(filter.maxPrice)) {
      return false;
    }
    
    // Filter by search term
    if (filter.searchTerm && 
        !product.PName.toLowerCase().includes(filter.searchTerm.toLowerCase()) &&
        !product.PDescription.toLowerCase().includes(filter.searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  const addToBasket = async (productId) => {
    try {
      // In a real app, you would call an API to add the product to the basket
      console.log(`Adding product ${productId} to basket`);
      // Implementation depends on your backend API and authentication system
    } catch (err) {
      console.error('Error adding to basket:', err);
    }
  };
  
  if (loading) {
    return <div className="text-center my-5">Loading products...</div>;
  }
  
  if (error) {
    return <div className="alert alert-danger my-3">{error}</div>;
  }
  
  const uniqueCategories = [...new Set(products.map(product => product.PType))];
  
  return (
    <div>
      <h2 className="mb-4">Products</h2>
      
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
      {filteredProducts.length === 0 ? (
        <div className="alert alert-info">No products match your filters.</div>
      ) : (
        <Row>
          {filteredProducts.map(product => (
            <Col key={product.PID} lg={4} md={6} sm={12} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>{product.PName}</Card.Title>
                  <Badge bg="secondary" className="mb-2">{product.PType}</Badge>
                  <Card.Text className="mb-2">
                    ${typeof product.PPrice === 'number' ? product.PPrice.toFixed(2) : '0.00'}
                  </Card.Text>
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
