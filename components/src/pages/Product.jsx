import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./product.css";

const Product = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState({});
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const getParams = () => {
    const params = new URLSearchParams(location.search);
    const data = {};
    for (const [key, value] of params.entries()) {
      data[key] = value;
    }
    return data;
  };

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);

    const search = new URLSearchParams(location.search);
    const id = search.get("id");

    if (id) {
      setLoading(true);
      setNotFound(false);
      let cancelled = false;
      fetch(`http://localhost:3001/api/products/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("not found");
          return res.json();
        })
        .then((data) => {
          if (cancelled) return;
          if (data.message) {
            setNotFound(true);
            setProduct({});
            return;
          }
          const imageUrl = data.image
            ? `http://localhost:3001/uploads/${data.image}`
            : "";
          setProduct({
            name: data.product,
            price: Number(data.price),
            mrp: Number(data.mrp ?? data.price),
            discount: data.discount || "",
            rating: String(data.rating ?? "4"),
            ratingCount: String(data.ratingCount ?? "0"),
            image: imageUrl,
            size: data.size || "Standard",
            colour: data.colour || "Various",
            brand: data.brand || "Snapdeal",
            pattern: data.pattern || "solid",
            description: data.description || "No description available",
            quantity: 1,
            category: data.category || "",
          });
        })
        .catch(() => {
          if (!cancelled) setNotFound(true);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }

    const params = getParams();
    if (
      params.category &&
      (!params.name || String(params.name).trim() === "")
    ) {
      navigate(
        `/category?category=${encodeURIComponent(params.category)}`,
        { replace: true }
      );
      return;
    }

    const productData = {
      name: params.name || "Product",
      price: Number(params.price || 0),
      mrp: Number(params.mrp || params.price || 0),
      discount: params.discount || "",
      rating: params.rating || "0.0",
      ratingCount: params.ratingCount || "0",
      image: params.image || "images/placeholder.svg",
      size: params.size || "M",
      colour: params.colour || "Black",
      brand: params.brand || "Generic",
      pattern: params.pattern || "solid",
      description: params.description || "No description available",
      quantity: 1,
    };

    setProduct(productData);
  }, [location.search, navigate]);

  const saveCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const addToCart = () => {
    const newItem = { ...product };

    const existingIndex = cart.findIndex(
      (item) =>
        item.name === newItem.name &&
        item.price === newItem.price &&
        item.size === newItem.size &&
        item.colour === newItem.colour
    );

    let updatedCart = [...cart];

    if (existingIndex !== -1) {
      updatedCart[existingIndex].quantity += 1;
    } else {
      updatedCart.push(newItem);
    }

    saveCart(updatedCart);

    navigate("/cart");
  };

  const buyNow = () => {
    const buyCart = [{ ...product, quantity: 1 }];
    const total = product.price;
    const cartData = encodeURIComponent(JSON.stringify(buyCart));

    navigate(`/checkout?total=${total}&items=1&cart=${cartData}`);
  };

  if (loading) {
    return (
      <div className="product-container">
        <p>Loading product…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="product-container">
        <h2>Product not found</h2>
        <button type="button" onClick={() => navigate("/dashboard")}>
          Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="product-container">
      <h2>{product.name}</h2>

      <img src={product.image} alt={product.name} width="250" />

      <p>Price: ₹{product.price}</p>
      <p>MRP: ₹{product.mrp}</p>
      {product.discount ? <p>Offer: {product.discount}</p> : null}
      <p>
        Rating: {product.rating} ★ ({product.ratingCount})
      </p>
      <p>Brand: {product.brand}</p>
      <p>Size: {product.size}</p>
      <p>Colour: {product.colour}</p>
      <p>Pattern: {product.pattern}</p>

      <div className="product-description-block">
        <h3>Description</h3>
        <p className="product-description-text">{product.description}</p>
      </div>

      <div className="product-actions">
        <button type="button" onClick={addToCart} className="add-cart-btn">
          Add to Cart
        </button>

        <button type="button" onClick={buyNow} className="buy-now-btn">
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default Product;
