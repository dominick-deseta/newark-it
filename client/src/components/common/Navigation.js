
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../auth/AuthContext';

const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Check if user is admin (admin status not implemented yet, so really just a user)
  const isAdmin = isAuthenticated && user;

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Newark-IT Store</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/products">Products</Nav.Link>
            
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/basket">Shopping Basket</Nav.Link>
                <NavDropdown title="My Account" id="basic-nav-dropdown">
                  <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/profile/credit-card">Credit Cards</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/profile/shipping-address">Shipping Addresses</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/orders">Order History</NavDropdown.Item>
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
              </>
            )}
            
            {isAdmin && (
              <Nav.Link as={Link} to="/statistics">Sales Statistics</Nav.Link>
            )}
          </Nav>
          
          {isAuthenticated && (
            <Navbar.Text className="text-white">
              Welcome, {user?.firstName || 'User'}
            </Navbar.Text>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
