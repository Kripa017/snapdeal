import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import './checkout.css';
import { getFullApiPath } from "../api";

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    email: '',
    phone: '',
    paymentMethod: 'cod',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });

  const [cart, setCart] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const buyNowCart = params.get('cart');
    const buyNowTotal = params.get('total');

    if (buyNowCart && buyNowTotal) {
      
      const decodedCart = JSON.parse(decodeURIComponent(buyNowCart));
      setCart(decodedCart);
    } else {
      
      const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(storedCart);
    }
  }, [location.search]);

  const params = new URLSearchParams(location.search);
  const buyNowTotal = params.get('total');

  const total = buyNowTotal ? parseFloat(buyNowTotal) : cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const validateForm = () => {
    const newErrors = {};

    // Required billing fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
   
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zip.trim()) newErrors.zip = 'Zip code is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    
    if (formData.paymentMethod === 'card') {
      // No frontend validation needed for card details with Razorpay
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handlePaymentChange = (method) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: method,
    }));
  };

  const [apiError, setApiError] = useState(null);

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }

    if (!cart || cart.length === 0) {
      setApiError('Your cart is empty. Add items before placing an order.');
      return;
    }

    const selectedPaymentMethod = formData.paymentMethod;

    const payload = {
      customer: {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zip: formData.zip.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      },
      paymentMethod: selectedPaymentMethod,
      items: cart.map((item) => ({
        productId: item._id || null,
        name: item.name || item.product || 'unnamed',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
      })),
      total,
    };

    try {
      setApiError(null);

      if (selectedPaymentMethod !== 'cod') {
        
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          setApiError('Failed to load payment system. Please try again.');
          return;
        }

        
        const response = await fetch(getFullApiPath('/api/orders'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to create order');
        }

        const { order, razorpayOrder } = data;

        const razorpayMethodOptions =
          formData.paymentMethod === 'upi'
            ? { upi: true }
            : formData.paymentMethod === 'card'
              ? { card: true }
              : formData.paymentMethod === 'netbanking'
                ? { netbanking: true }
                : undefined;

       
        const options = {
          key: razorpayOrder.key,
          amount: razorpayOrder.amount,
          currency: 'INR',
          name: 'Snapdeal',
          description: 'Purchase Payment',
          order_id: razorpayOrder.id,
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#3399cc',
          },
          method: razorpayMethodOptions,
          upi: formData.paymentMethod === 'upi' ? {
            flow: 'collect'
          } : undefined,
          notes: {
            address: formData.address,
          },
          handler: async function (response) {
            console.log('Payment successful:', response);
            
            try {
              const verifyResponse = await fetch(getFullApiPath('/api/verify-payment'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  orderId: order._id,
                }),
              });

              const verifyData = await verifyResponse.json();
              console.log('Verification response:', verifyData);

              if (!verifyResponse.ok || !verifyData.success) {
                throw new Error(verifyData.error || 'Payment verification failed');
              }

             
              localStorage.removeItem('cart');
              setCart([]);
              setOrderPlaced(true);
              setTimeout(() => {
                navigate('/dashboard');
              }, 2000);
            } catch (verifyError) {
              console.error('Payment verification error:', verifyError);
              setApiError('Payment verification failed. Please contact support.');
            }
          },
          modal: {
            ondismiss: function() {
              console.log('Payment modal dismissed');
              setApiError('Payment was cancelled. Please try again.');
            },
            confirm_close: true,
            escape: true,
            animation: true,
          },
          retry: {
            enabled: false,
          },
          remember_customer: false,
        };

        console.log('Opening Razorpay with paymentMethod:', formData.paymentMethod, options);
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // COD payment
        const response = await fetch(getFullApiPath('/api/orders'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to place order');
        }

        localStorage.removeItem('cart');
        setCart([]);
        setOrderPlaced(true);

        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      setApiError(error.message);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <h2>Checkout</h2>

        <div className="box">
        {/* Billing */}
        <h3>Billing</h3>

        <input
          type="text"
          name="firstName"
          placeholder="First Name *"
          value={formData.firstName}
          onChange={handleChange}
        />
        {errors.firstName && <div className="error-message">{errors.firstName}</div>}
        <input
          type="text"
          name="lastName"
          placeholder="Last Name *"
          value={formData.lastName}
          onChange={handleChange}
        />
        {errors.lastName && <div className="error-message">{errors.lastName}</div>}
        <input
          type="text"
          name="address"
          placeholder="Address *"
          value={formData.address}
          onChange={handleChange}
        />
        {errors.address && <div className="error-message">{errors.address}</div>}
        <input
          type="text"
          name="city"
          placeholder="City *"
          value={formData.city}
          onChange={handleChange}
        />
        {errors.city && <div className="error-message">{errors.city}</div>}

        <div className="row">
          <input
            type="text"
            name="state"
            placeholder="State *"
            value={formData.state}
            onChange={handleChange}
          />
          <input
            type="text"
            name="zip"
            placeholder="Zip *"
            value={formData.zip}
            onChange={handleChange}
          />
        </div>
        {errors.state && <div className="error-message">{errors.state}</div>}
        {errors.zip && <div className="error-message">{errors.zip}</div>}

        <input
          type="email"
          name="email"
          placeholder="Email *"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <div className="error-message">{errors.email}</div>}
        <input
          type="text"
          name="phone"
          placeholder="Phone *"
          value={formData.phone}
          onChange={handleChange}
        />
        {errors.phone && <div className="error-message">{errors.phone}</div>}

        {/* Payment */}
        <h3>Payment</h3>

        <div className="pay">
          <label>
            <input
              type="radio"
              name="payment"
              checked={formData.paymentMethod === 'cod'}
              onChange={() => handlePaymentChange('cod')}
            />
            Cash on Delivery
          </label>

          <label>
            <input
              type="radio"
              name="payment"
              checked={formData.paymentMethod === 'card'}
              onChange={() => handlePaymentChange('card')}
            />
            Card
          </label>

          <label>
            <input
              type="radio"
              name="payment"
              checked={formData.paymentMethod === 'upi'}
              onChange={() => handlePaymentChange('upi')}
            />
            UPI
          </label>

          <label>
            <input
              type="radio"
              name="payment"
              checked={formData.paymentMethod === 'netbanking'}
              onChange={() => handlePaymentChange('netbanking')}
            />
            Net Banking
          </label>
        </div>

        {formData.paymentMethod === 'card' && (
          <div style={{ marginTop: '15px' }}>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
              Test Card: <strong>4111 1111 1111 1111</strong> | Expiry: <strong>12/26</strong> | CVV: <strong>123</strong>
            </p>
          </div>
        )}

        {formData.paymentMethod === 'upi' && (
          <div style={{ marginTop: '15px' }}>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
              In the Razorpay popup, choose the UPI option and select "Other UPI Apps" or manual UPI entry.
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
              Enter UPI ID: <strong>success@razorpay</strong>
            </p>
          </div>
        )}

        {formData.paymentMethod === 'netbanking' && (
          <div style={{ marginTop: '15px' }}>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
              Use test net banking: User ID <strong>test</strong>, Password <strong>test</strong>, OTP <strong>123456</strong>.
            </p>
          </div>
        )}

        <div className="order">
          <p>
            Total <span>₹{total}</span>
          </p>
          <button onClick={handlePlaceOrder}>Place Order</button>
        </div>

        {apiError && <div className="error-message" style={{ marginTop: '10px' }}>{apiError}</div>}

        
      </div>
    </div>
  </div>
  );
};

export default Checkout;