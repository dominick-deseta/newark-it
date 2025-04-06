import React from 'react';
import { Container } from 'react-bootstrap';

const Header = () => {
  return (
    <header className="bg-primary text-white py-3">
      <Container>
        <h1 className="mb-0">Newark-IT Computer Store</h1>
        <p className="mb-0">Your one-stop shop for computers, laptops, and printers</p>
      </Container>
    </header>
  );
};

export default Header;