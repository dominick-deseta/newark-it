const pool = require('../config/db');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { search, minPrice, maxPrice, type } = req.query;
    
    // Build base query
    let query = 'SELECT * FROM PRODUCT';
    const params = [];
    
    // Add WHERE clauses for filters if they exist
    if (search || minPrice || maxPrice || type) {
      query += ' WHERE';
      
      const conditions = [];
      
      if (search) {
        conditions.push(' (PName LIKE ? OR PDescription LIKE ?)');
        params.push(`%${search}%`);
        params.push(`%${search}%`);
      }
      
      if (minPrice) {
        conditions.push(' PPrice >= ?');
        params.push(parseFloat(minPrice));
      }
      
      if (maxPrice) {
        conditions.push(' PPrice <= ?');
        params.push(parseFloat(maxPrice));
      }
      
      if (type) {
        conditions.push(' PType = ?');
        params.push(type);
      }
      
      query += conditions.join(' AND');
    }
    
    // Execute query
    const [products] = await pool.query(query, params);
    
    // Add extra details for specific product types (desktops, laptops, printers)
    for (const product of products) {
      if (product.PType === 'desktop' || product.PType === 'laptop') {
        // Get computer details
        const [computers] = await pool.query(
          'SELECT * FROM COMPUTER WHERE PID = ?', 
          [product.PID]
        );
        
        if (computers.length > 0) {
          product.CPUType = computers[0].CPUType;
        }
        
        if (product.PType === 'laptop') {
          // Get laptop-specific details
          const [laptops] = await pool.query(
            'SELECT * FROM LAPTOP WHERE PID = ?', 
            [product.PID]
          );
          
          if (laptops.length > 0) {
            product.BatteryType = laptops[0].BType;
            product.Weight = laptops[0].Weight;
          }
        }
      } else if (product.PType === 'printer') {
        // Get printer details
        const [printers] = await pool.query(
          'SELECT * FROM PRINTER WHERE PID = ?', 
          [product.PID]
        );
        
        if (printers.length > 0) {
          product.PrinterType = printers[0].PrinterType;
          product.Resolution = printers[0].Resolution;
        }
      }
      
      // Check if product is on offer
      const [offers] = await pool.query(
        'SELECT * FROM OFFER_PRODUCT WHERE PID = ?',
        [product.PID]
      );
      
      if (offers.length > 0) {
        product.OnOffer = true;
        product.OfferPrice = offers[0].OfferPrice;
      } else {
        product.OnOffer = false;
      }
    }
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Get product details
    const [products] = await pool.query(
      'SELECT * FROM PRODUCT WHERE PID = ?',
      [productId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const product = products[0];
    
    // Add extra details based on product type
    if (product.PType === 'desktop' || product.PType === 'laptop') {
      // Get computer details
      const [computers] = await pool.query(
        'SELECT * FROM COMPUTER WHERE PID = ?', 
        [product.PID]
      );
      
      if (computers.length > 0) {
        product.CPUType = computers[0].CPUType;
      }
      
      if (product.PType === 'laptop') {
        // Get laptop-specific details
        const [laptops] = await pool.query(
          'SELECT * FROM LAPTOP WHERE PID = ?', 
          [product.PID]
        );
        
        if (laptops.length > 0) {
          product.BatteryType = laptops[0].BType;
          product.Weight = laptops[0].Weight;
        }
      }
    } else if (product.PType === 'printer') {
      // Get printer details
      const [printers] = await pool.query(
        'SELECT * FROM PRINTER WHERE PID = ?', 
        [product.PID]
      );
      
      if (printers.length > 0) {
        product.PrinterType = printers[0].PrinterType;
        product.Resolution = printers[0].Resolution;
      }
    }
    
    // Check if product is on offer
    const [offers] = await pool.query(
      'SELECT * FROM OFFER_PRODUCT WHERE PID = ?',
      [product.PID]
    );
    
    if (offers.length > 0) {
      product.OnOffer = true;
      product.OfferPrice = offers[0].OfferPrice;
    } else {
      product.OnOffer = false;
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get products by type
exports.getProductsByType = async (req, res) => {
  try {
    const productType = req.params.type;
    
    // Get products of specified type
    const [products] = await pool.query(
      'SELECT * FROM PRODUCT WHERE PType = ?',
      [productType]
    );
    
    // Add type-specific details and check for offers
    for (const product of products) {
      if (productType === 'desktop' || productType === 'laptop') {
        // Get computer details
        const [computers] = await pool.query(
          'SELECT * FROM COMPUTER WHERE PID = ?', 
          [product.PID]
        );
        
        if (computers.length > 0) {
          product.CPUType = computers[0].CPUType;
        }
        
        if (productType === 'laptop') {
          // Get laptop-specific details
          const [laptops] = await pool.query(
            'SELECT * FROM LAPTOP WHERE PID = ?', 
            [product.PID]
          );
          
          if (laptops.length > 0) {
            product.BatteryType = laptops[0].BType;
            product.Weight = laptops[0].Weight;
          }
        }
      } else if (productType === 'printer') {
        // Get printer details
        const [printers] = await pool.query(
          'SELECT * FROM PRINTER WHERE PID = ?', 
          [product.PID]
        );
        
        if (printers.length > 0) {
          product.PrinterType = printers[0].PrinterType;
          product.Resolution = printers[0].Resolution;
        }
      }
      
      // Check if product is on offer
      const [offers] = await pool.query(
        'SELECT * FROM OFFER_PRODUCT WHERE PID = ?',
        [product.PID]
      );
      
      if (offers.length > 0) {
        product.OnOffer = true;
        product.OfferPrice = offers[0].OfferPrice;
      } else {
        product.OnOffer = false;
      }
    }
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by type:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get special offers
exports.getSpecialOffers = async (req, res) => {
  try {
    // Get all products on offer
    const [offers] = await pool.query(
      'SELECT p.*, o.OfferPrice FROM PRODUCT p JOIN OFFER_PRODUCT o ON p.PID = o.PID'
    );
    
    // Add type-specific details
    for (const product of offers) {
      if (product.PType === 'desktop' || product.PType === 'laptop') {
        // Get computer details
        const [computers] = await pool.query(
          'SELECT * FROM COMPUTER WHERE PID = ?', 
          [product.PID]
        );
        
        if (computers.length > 0) {
          product.CPUType = computers[0].CPUType;
        }
        
        if (product.PType === 'laptop') {
          // Get laptop-specific details
          const [laptops] = await pool.query(
            'SELECT * FROM LAPTOP WHERE PID = ?', 
            [product.PID]
          );
          
          if (laptops.length > 0) {
            product.BatteryType = laptops[0].BType;
            product.Weight = laptops[0].Weight;
          }
        }
      } else if (product.PType === 'printer') {
        // Get printer details
        const [printers] = await pool.query(
          'SELECT * FROM PRINTER WHERE PID = ?', 
          [product.PID]
        );
        
        if (printers.length > 0) {
          product.PrinterType = printers[0].PrinterType;
          product.Resolution = printers[0].Resolution;
        }
      }
      
      product.OnOffer = true;
    }
    
    res.json(offers);
  } catch (error) {
    console.error('Error fetching special offers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add product (admin only)
exports.addProduct = async (req, res) => {
  try {
    const {
      name,
      type,
      price,
      description,
      quantity,
      // Type-specific fields
      cpuType,
      batteryType,
      weight,
      printerType,
      resolution,
      // Offer fields
      isOnOffer,
      offerPrice
    } = req.body;
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert base product
      const [productResult] = await connection.query(
        'INSERT INTO PRODUCT (PName, PType, PPrice, PDescription, PQuantity) VALUES (?, ?, ?, ?, ?)',
        [name, type, price, description, quantity]
      );
      
      const productId = productResult.insertId;
      
      // Insert type-specific details
      if (type === 'desktop' || type === 'laptop') {
        await connection.query(
          'INSERT INTO COMPUTER (PID, CPUType) VALUES (?, ?)',
          [productId, cpuType]
        );
        
                  if (type === 'laptop') {
          await connection.query(
            'INSERT INTO LAPTOP (PID, BType, Weight) VALUES (?, ?, ?)',
            [productId, batteryType, weight]
          );
        }
      } else if (type === 'printer') {
        await connection.query(
          'INSERT INTO PRINTER (PID, PrinterType, Resolution) VALUES (?, ?, ?)',
          [productId, printerType, resolution]
        );
      }
      
      // Add offer if applicable
      if (isOnOffer && offerPrice) {
        await connection.query(
          'INSERT INTO OFFER_PRODUCT (PID, OfferPrice) VALUES (?, ?)',
          [productId, offerPrice]
        );
      }
      
      await connection.commit();
      
      res.status(201).json({
        message: 'Product added successfully',
        productId
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update product (admin only)
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      name,
      price,
      description,
      quantity,
      // Type-specific fields
      cpuType,
      batteryType,
      weight,
      printerType,
      resolution,
      // Offer fields
      isOnOffer,
      offerPrice
    } = req.body;
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Get current product
      const [products] = await connection.query(
        'SELECT * FROM PRODUCT WHERE PID = ?',
        [productId]
      );
      
      if (products.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Product not found' });
      }
      
      const productType = products[0].PType;
      
      // Update base product
      await connection.query(
        'UPDATE PRODUCT SET PName = ?, PPrice = ?, PDescription = ?, PQuantity = ? WHERE PID = ?',
        [name, price, description, quantity, productId]
      );
      
      // Update type-specific details
      if (productType === 'desktop' || productType === 'laptop') {
        await connection.query(
          'UPDATE COMPUTER SET CPUType = ? WHERE PID = ?',
          [cpuType, productId]
        );
        
        if (productType === 'laptop') {
          await connection.query(
            'UPDATE LAPTOP SET BType = ?, Weight = ? WHERE PID = ?',
            [batteryType, weight, productId]
          );
        }
      } else if (productType === 'printer') {
        await connection.query(
          'UPDATE PRINTER SET PrinterType = ?, Resolution = ? WHERE PID = ?',
          [printerType, resolution, productId]
        );
      }
      
      // Update offer status
      if (isOnOffer && offerPrice) {
        // Check if offer exists
        const [offers] = await connection.query(
          'SELECT * FROM OFFER_PRODUCT WHERE PID = ?',
          [productId]
        );
        
        if (offers.length > 0) {
          // Update existing offer
          await connection.query(
            'UPDATE OFFER_PRODUCT SET OfferPrice = ? WHERE PID = ?',
            [offerPrice, productId]
          );
        } else {
          // Create new offer
          await connection.query(
            'INSERT INTO OFFER_PRODUCT (PID, OfferPrice) VALUES (?, ?)',
            [productId, offerPrice]
          );
        }
      } else {
        // Remove offer if it exists
        await connection.query(
          'DELETE FROM OFFER_PRODUCT WHERE PID = ?',
          [productId]
        );
      }
      
      await connection.commit();
      
      res.json({ message: 'Product updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Check if product exists
    const [products] = await pool.query(
      'SELECT * FROM PRODUCT WHERE PID = ?',
      [productId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if product is in any baskets or transactions
    const [basketItems] = await pool.query(
      'SELECT * FROM APPEARS_IN WHERE PID = ?',
      [productId]
    );
    
    if (basketItems.length > 0) {
      return res.status(400).json({ message: 'Cannot delete product that is in baskets or transactions' });
    }
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      const productType = products[0].PType;
      
      // Delete type-specific details
      if (productType === 'desktop' || productType === 'laptop') {
        if (productType === 'laptop') {
          await connection.query(
            'DELETE FROM LAPTOP WHERE PID = ?',
            [productId]
          );
        }
        
        await connection.query(
          'DELETE FROM COMPUTER WHERE PID = ?',
          [productId]
        );
      } else if (productType === 'printer') {
        await connection.query(
          'DELETE FROM PRINTER WHERE PID = ?',
          [productId]
        );
      }
      
      // Delete offer if exists
      await connection.query(
        'DELETE FROM OFFER_PRODUCT WHERE PID = ?',
        [productId]
      );
      
      // Delete base product
      await connection.query(
        'DELETE FROM PRODUCT WHERE PID = ?',
        [productId]
      );
      
      await connection.commit();
      
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};