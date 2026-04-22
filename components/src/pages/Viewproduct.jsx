import React, { useState, useEffect } from 'react';
import './viewproduct.css';
import { getFullApiPath, getUploadFileUrl } from '../api';

const Viewproduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(getFullApiPath('/api/products'));
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <div className="header">Admin Dashboard</div>
      <div className="container">
        <h3>User Product Details</h3>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Product Image</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Description</th>
              

            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>{product.product}</td>
                <td>
                  {product.image ? (
                    <img 
                      src={getUploadFileUrl(product.image)} 
                      alt={product.product} 
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                  ) : (
                    'No Image'
                  )}
                </td>
                <td>{product.category}</td>
                <td>{product.quantity}</td>
                <td>Rs {product.price}</td>
                <td>{product.description}</td>
                
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p>No products available.</p>
        )}
      </div>
    </>
  );
};

export default Viewproduct;