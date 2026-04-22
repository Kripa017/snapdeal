import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './editproduct.css';
import { getFullApiPath, getUploadFileUrl } from '../api';

const Editproduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    product: '',
    image: '',
    category: '',
    quantity: '',
    description: '',
    price: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(getFullApiPath(`/api/products/${id}`));
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      const data = await response.json();
      setProduct(data);
      if (data.image) {
        setImagePreview(getUploadFileUrl(data.image));
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file' && files && files[0]) {
      const file = files[0];
      setSelectedFile(file);

      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProduct({
        ...product,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;

      if (selectedFile) {
        
        const formData = new FormData();
        formData.append('product', product.product);
        formData.append('category', product.category);
        formData.append('quantity', product.quantity);
        formData.append('description', product.description);
        formData.append('price', product.price);
        formData.append('image', selectedFile);

        response = await fetch(getFullApiPath(`/api/products/${id}/upload`), {
          method: 'PUT',
          body: formData,
        });
      } else {
        
        response = await fetch(getFullApiPath(`/api/products/${id}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(product),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      alert('Product updated successfully!');
      navigate('/manageproduct');
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Failed to update product');
    }
  };

  const handleCancel = () => {
    navigate('/manageproduct');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <div className="header">Edit Product</div>
      <div className="container">
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="product">Product Name:</label>
              <input
                type="text"
                id="product"
                name="product"
                value={product.product}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category:</label>
              <input
                type="text"
                id="category"
                name="category"
                value={product.category}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Quantity:</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={product.quantity}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price:</label>
              <input
                type="number"
                id="price"
                name="price"
                value={product.price}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{flex: '1'}}>
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={product.description}
                onChange={handleInputChange}
                rows="4"
                required
              ></textarea>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{flex: '1'}}>
              <label htmlFor="image">Product Image:</label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleInputChange}
              />
              {imagePreview && (
                <div className="image-preview">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                  />
                  <p className="image-info">
                    {selectedFile ? `New image: ${selectedFile.name}` : 'Current product image'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Editproduct;
