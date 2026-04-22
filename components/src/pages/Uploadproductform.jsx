import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./uploadproductform.css";
import { NAV_CATEGORIES } from "../data/navCategories";
import { getFullApiPath } from "../api";

const initialForm = () => ({
  product: "",
  category: "",
  quantity: "",
  price: "",
  mrp: "",
  brand: "",
  size: "",
  colour: "",
  pattern: "",
  rating: "4",
  ratingCount: "0",
  discount: "",
  description: "",
});

const Uploadproductform = () => {
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("product", form.product);
    formData.append("category", form.category);
    formData.append("quantity", form.quantity);
    formData.append("price", form.price);
    formData.append("mrp", form.mrp);
    formData.append("brand", form.brand);
    formData.append("size", form.size);
    formData.append("colour", form.colour);
    formData.append("pattern", form.pattern);
    formData.append("rating", form.rating);
    formData.append("ratingCount", form.ratingCount);
    formData.append("discount", form.discount);
    formData.append("description", form.description);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await fetch(getFullApiPath("/api/products"), {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Product uploaded successfully");
        setForm(initialForm());
        setImage(null);
        const fileInput = document.querySelector(
          'input[type="file"][accept="image/*"]'
        );
        if (fileInput) fileInput.value = "";
        navigate("/dashboard");
      } else {
        alert("Failed to upload product");
      }
    } catch (error) {
      console.error("Error uploading product:", error);
      alert("Error uploading product");
    }
  };

  return (
    <div className="container upload-product-page">
      <h2>Upload Product</h2>

      <form onSubmit={handleSubmit} className="upload-product-form">
        <label>Product Name</label>
        <input
          type="text"
          placeholder="Enter product name (e.g., Water Bottle)"
          value={form.product}
          onChange={setField("product")}
          required
        />

        <label>Product Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />

        <label htmlFor="upload-category">Category</label>
        <select
          id="upload-category"
          value={form.category}
          onChange={setField("category")}
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

        <label>Quantity (stock)</label>
        <input
          type="number"
          min="0"
          placeholder="Enter quantity"
          value={form.quantity}
          onChange={setField("quantity")}
          required
        />

        <p className="upload-form-section-title">Pricing &amp; offer</p>
        <label>Price (₹)</label>
        <input
          type="number"
          min="0"
          step="1"
          placeholder="Selling price"
          value={form.price}
          onChange={setField("price")}
          required
        />

        <label>MRP (₹)</label>
        <input
          type="number"
          min="0"
          step="1"
          placeholder="Maximum retail price"
          value={form.mrp}
          onChange={setField("mrp")}
          required
        />

        <label>Discount label (optional)</label>
        <input
          type="text"
          placeholder="e.g. 20% OFF"
          value={form.discount}
          onChange={setField("discount")}
        />

        <p className="upload-form-section-title">Product details (shown on product page)</p>
        <label>Brand</label>
        <input
          type="text"
          placeholder="Brand name"
          value={form.brand}
          onChange={setField("brand")}
          required
        />

        <label>Size</label>
        <input
          type="text"
          placeholder="e.g. M, 32, 6.5 inch"
          value={form.size}
          onChange={setField("size")}
          required
        />

        <label>Colour</label>
        <input
          type="text"
          placeholder="e.g. Black, Navy"
          value={form.colour}
          onChange={setField("colour")}
          required
        />

        <label>Pattern</label>
        <input
          type="text"
          placeholder="e.g. solid, striped"
          value={form.pattern}
          onChange={setField("pattern")}
          required
        />

        <label>Rating (0–5)</label>
        <input
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={form.rating}
          onChange={setField("rating")}
          required
        />

        <label>Rating count (reviews)</label>
        <input
          type="number"
          min="0"
          placeholder="e.g. 120"
          value={form.ratingCount}
          onChange={setField("ratingCount")}
          required
        />

        <p className="upload-form-section-title">Description</p>
        <label htmlFor="upload-description">Full description</label>
        <textarea
          id="upload-description"
          placeholder="Detailed description — this appears only on the product detail page, not on the dashboard."
          value={form.description}
          onChange={setField("description")}
          rows="5"
          required
        />

        <button type="submit" className="submit-btn">
          Upload Product
        </button>
      </form>
    </div>
  );
};

export default Uploadproductform;
