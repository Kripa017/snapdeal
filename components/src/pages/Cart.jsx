import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './cart.css';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate(); 

  
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, []);

  
  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  
  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    updateCart(newCart);
  };

  
  const updateQuantity = (index, action) => {
    const newCart = [...cart];

    if (action === "increase") {
      newCart[index].quantity += 1;
    } else if (action === "decrease" && newCart[index].quantity > 1) {
      newCart[index].quantity -= 1;
    }

    updateCart(newCart);
  };

  
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  
  if (cart.length === 0) {
    return <h2>Your cart is empty</h2>;
  }

  return (
    <div className="cart-container">
      <h2 className="cart-title">Cart</h2>

      {cart.map((product, index) => (
        <div className="cart-item" key={index}>
          
          <div className="cart-item-details">
            <h3>{product.name}</h3>
            <p>₹{product.price}</p>

            <div className="quantity-controls">
              <button onClick={() => updateQuantity(index, "decrease")}>-</button>
              <span>{product.quantity}</span>
              <button onClick={() => updateQuantity(index, "increase")}>+</button>
            </div>

            <button
              className="remove-btn"
              onClick={() => removeFromCart(index)}
            >
              Remove
            </button>
          </div>

          <div>
            <p>Total: ₹{product.price * product.quantity}</p>
          </div>

        </div>
      ))}

      <div className="cart-summary">
        <h3>Total Items: {totalItems}</h3>
        <h2>Total Price: ₹{total}</h2>

        
        <button
          className="checkout-btn"
          onClick={() => navigate("/checkout")}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;