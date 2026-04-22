import React, { useState, useEffect } from 'react';
import './manageproduct.css';
import { getFullApiPath, getUploadFileUrl } from '../api';

const Manageproduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(getFullApiPath('/api/products'));
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(getFullApiPath(`/api/products/${productId}`), {
          method: 'DELETE'
        });
        if (response.ok) {
          setProducts(products.filter(p => p._id !== productId));
          alert('Product deleted successfully');
        } else {
          alert('Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      }
    }
  };

  const handleEdit = (productId) => {
    window.location.href = `/editproduct/${productId}`;
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
              <th>Delete</th>
              <th>Edit</th>
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
                <td>
                  <button className="btn btn-danger" onClick={() => handleDelete(product._id)}>
                    Delete
                  </button>
                </td>
                <td>
                  <button className="btn btn-warning" onClick={() => handleEdit(product._id)}>
                    Edit
                  </button>
                </td>
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

export default Manageproduct;