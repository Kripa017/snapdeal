import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./addproduct.css";
import { NAV_CATEGORIES } from "../data/navCategories";
import { getFullApiPath } from "../api";

const Addproduct = () => {
  const [product, setProduct] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('product', product);
    formData.append('category', category);
    formData.append('quantity', quantity);
    formData.append('description', description);
    formData.append('price', price);
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetch(getFullApiPath('/api/products'), {
        method: 'POST',
        body: formData,
      });

      
      
      if (response.ok) {
        alert('Product added successfully');
        setProduct('');
        setCategory('');
        setQuantity('');
        setDescription('');
        setPrice('');
        setImage(null);
        
        const fileInput = document.querySelector(
          'input[type="file"][accept="image/*"]'
        );
        if (fileInput) fileInput.value = "";
        navigate("/viewproduct");
      } else {
        alert('Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product');
    }
  };

  return (
    <div className="container add-product-page">
      <h2>Add Product</h2>

      <form onSubmit={handleSubmit} className="add-product-form">
        <label>Product Name</label>
        <input
          type="text"
          placeholder="Enter product name"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          required
        />

        <label>Product Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />

        <label htmlFor="add-product-category">Category</label>
        <select
          id="add-product-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="" disabled>
            Select category
          </option>
          {NAV_CATEGORIES.map(({ label, category: cat }) => (
            <option key={cat} value={cat}>
              {label}
            </option>
          ))}
        </select>

        <label>Quantity</label>
        <input
          type="number"
          placeholder="Enter quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />

        <label>Description</label>
        <input
          type="text"
          placeholder="Enter description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label>Price</label>
        <input
          type="number"
          placeholder="Enter price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <div className="actions">
          <button type="submit" className="primary-btn">
            Add Product
          </button>
          
            
          
            
    
        </div>
      </form>
    </div>
  );
};

export default Addproduct;
