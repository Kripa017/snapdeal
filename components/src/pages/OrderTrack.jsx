import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ordertrack.css";

const OrderTrack = () => {
  const [status, setStatus] = useState("placed");

  const steps = [
    { key: "placed", label: "Order Placed" },
    { key: "packed", label: "Packed" },
    { key: "shipped", label: "Shipped" },
    { key: "out", label: "Out for Delivery" },
    { key: "delivered", label: "Delivered" },
  ];

  const getClass = (step) => {
    if (status === step) return "active";
    if (
      steps.findIndex((s) => s.key === step) <
      steps.findIndex((s) => s.key === status)
    )
      return "completed";
    return "";
  };

  return (
    <div className="track-container">
      <h2>Track Your Order</h2>

      <div className="tracker">
        {steps.map((step) => (
          <div key={step.key} className={`step ${getClass(step.key)}`}>
            <div className="circle">
              {getClass(step.key) === "completed" ? "✔" : ""}
            </div>
            <p>{step.label}</p>
          </div>
        ))}
      </div>

      {/* Buttons to simulate status */}
      
    </div>
  );
};

export default OrderTrack;