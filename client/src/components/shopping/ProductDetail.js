import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Row, Col, ListGroup, Form, Alert } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { formatPrice } from '../utils/utilities';

const ProductDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToBasket, setAddedToBasket] = useState(false);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        // Fetch product details from the backend
        const response = await axios.get(`http://localhost:3001/api/products/${id}`);
        setProduct(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= (product?.PQuantity || 1)) {
      setQuantity(value);
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    if (quantity < (product?.PQuantity || 1)) {
      setQuantity(quantity + 1);
    }
  };
  
  const addToBasket = async () => {
    try {
      if (!isAuthenticated) {
        // Redirect to login if user is not authenticated
        navigate('/login');
        return;
      }
      
      // Call the backend API to add the product to the basket
      await axios.post('http://localhost:3001/api/basket/items', {
        productId: product.PID,
        quantity
      });
      
      // Show success message
      setAddedToBasket(true);
      
      // Reset after a few seconds
      setTimeout(() => {
        setAddedToBasket(false);
      }, 3000);
    } catch (err) {
      console.error('Error adding to basket:', err);
      setError('Failed to add item to basket. Please try again.');
    }
  };
  
  if (loading) {
    return <div className="text-center my-5">Loading product details...</div>;
  }
  
  if (error) {
    return <Alert variant="danger" className="my-3">{error}</Alert>;
  }
  
  if (!product) {
    return <Alert variant="warning" className="my-3">Product not found</Alert>;
  }
  
  return (
    <div>
      <div className="mb-4">
        <Link to="/products" className="btn btn-outline-secondary">
          &lt; Back to Products
        </Link>
      </div>
      
      {addedToBasket && (
        <Alert variant="success" className="mb-4">
          Product added to your basket!
        </Alert>
      )}
      
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6} className="mb-4 mb-md-0">
              <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
                <span className="text-muted">Product Image Placeholder</span>
              </div>
            </Col>
            
            <Col md={6}>
              <h2>{product.PName}</h2>
              
              <div className="mb-3">
                <Badge bg="secondary" className="me-2">{product.PType}</Badge>
                {product.OnOffer && (
                  <Badge bg="success">Special Offer</Badge>
                )}
              </div>
              
              <div className="mb-3">
                {product.OnOffer ? (
                  <>
                    <span className="text-decoration-line-through text-muted me-2">
                      ${formatPrice(product.PPrice)}
                    </span>
                    <span className="fs-4 fw-bold text-danger">
                      ${formatPrice(product.OfferPrice)}
                    </span>
                  </>
                ) : (
                  <span className="fs-4 fw-bold">
                    ${formatPrice(product.PPrice)}
                  </span>
                )}
              </div>
              
              <p className="mb-4">{product.PDescription}</p>
              
              <div className="mb-3">
                <div className="mb-2">Quantity:</div>
                <div className="d-flex align-items-center">
                  <Button 
                    variant="outline-secondary" 
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <Form.Control
                    type="number"
                    min="1"
                    max={product.PQuantity}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="mx-2"
                    style={{ width: '60px' }}
                  />
                  <Button 
                    variant="outline-secondary" 
                    onClick={increaseQuantity}
                    disabled={quantity >= product.PQuantity}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <div className="mb-3">
                <Badge bg={product.PQuantity > 0 ? 'success' : 'danger'}>
                  {product.PQuantity > 0 
                    ? `In Stock (${product.PQuantity} available)` 
                    : 'Out of Stock'}
                </Badge>
              </div>
              
              <Button 
                variant="primary" 
                size="lg" 
                onClick={addToBasket}
                disabled={product.PQuantity < 1}
                className="w-100"
              >
                Add to Basket
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <Card>
        <Card.Header>
          <h5 className="mb-0">Specifications</h5>
        </Card.Header>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <Row>
              <Col md={4} className="fw-bold">Product ID:</Col>
              <Col md={8}>{product.PID}</Col>
            </Row>
          </ListGroup.Item>
          <ListGroup.Item>
            <Row>
              <Col md={4} className="fw-bold">Product Type:</Col>
              <Col md={8} className="text-capitalize">{product.PType}</Col>
            </Row>
          </ListGroup.Item>
          
          {/* CPU Type for computers */}
          {(product.PType === 'laptop' || product.PType === 'desktop') && product.CPUType && (
            <ListGroup.Item>
              <Row>
                <Col md={4} className="fw-bold">CPU Type:</Col>
                <Col md={8}>{product.CPUType}</Col>
              </Row>
            </ListGroup.Item>
          )}
          
          {/* Laptop-specific details */}
          {product.PType === 'laptop' && (
            <>
              {product.BatteryType && (
                <ListGroup.Item>
                  <Row>
                    <Col md={4} className="fw-bold">Battery Type:</Col>
                    <Col md={8}>{product.BatteryType}</Col>
                  </Row>
                </ListGroup.Item>
              )}
              {product.Weight && (
                <ListGroup.Item>
                  <Row>
                    <Col md={4} className="fw-bold">Weight:</Col>
                    <Col md={8}>{product.Weight} lbs</Col>
                  </Row>
                </ListGroup.Item>
              )}
            </>
          )}
          
          {/* Printer-specific details */}
          {product.PType === 'printer' && (
            <>
              {product.PrinterType && (
                <ListGroup.Item>
                  <Row>
                    <Col md={4} className="fw-bold">Printer Type:</Col>
                    <Col md={8}>{product.PrinterType}</Col>
                  </Row>
                </ListGroup.Item>
              )}
              {product.Resolution && (
                <ListGroup.Item>
                  <Row>
                    <Col md={4} className="fw-bold">Resolution:</Col>
                    <Col md={8}>{product.Resolution}</Col>
                  </Row>
                </ListGroup.Item>
              )}
            </>
          )}
        </ListGroup>
      </Card>
    </div>
  );
};

export default ProductDetail;