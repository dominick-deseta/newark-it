import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <Container>
        <Row>
          <Col md={4}>
            <h5>Newark-IT Computer Store</h5>
            <p>Your one-stop shop for quality computers, laptops, and printers.</p>
          </Col>
          <Col md={4}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-white">Home</a></li>
              <li><a href="/products" className="text-white">Products</a></li>
              <li><a href="/register" className="text-white">Register</a></li>
              <li><a href="/login" className="text-white">Login</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact</h5>
            <address>
              <p>123 Tech Street<br />Newark, NJ 07102</p>
              <p>Email: info@newark-it.com<br />Phone: (123) 456-7890</p>
            </address>
          </Col>
        </Row>
        <hr className="my-3" />
        <div className="text-center">
          <p className="mb-0">&copy; {new Date().getFullYear()} Newark-IT. All rights reserved.</p>
          <p className="small">CS 631 - Online Computer Store Project</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;