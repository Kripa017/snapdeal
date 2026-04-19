import React, { useEffect, useState } from 'react';
import './order.css';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const STATUS_OPTIONS = ['pending', 'order confirmed', 'shipped', 'delivered'];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:3001/api/orders');
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Could not load orders');
        }
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, nextStatus) => {
    const prevOrders = orders;
    setOrders((curr) =>
      curr.map((o) => (o._id === orderId ? { ...o, status: nextStatus } : o))
    );

    try {
      setUpdatingOrderId(orderId);
      const res = await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Failed to update status');
      }

      setOrders((curr) =>
        curr.map((o) => (o._id === orderId ? (data.order || o) : o))
      );
    } catch (err) {
      setOrders(prevOrders);
      alert(err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) return <div className="order-page"><h2>Loading orders...</h2></div>;
  if (error) return <div className="order-page"><h2>Error: {error}</h2></div>;

  return (
    <div className="order-page">
      <h2>Order List</h2>
      {orders.length === 0 ? (
        <p>No orders placed yet.</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Address</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Status</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>{order.customer.firstName} {order.customer.lastName}</td>
                <td>
                  {order.customer.phone} <br />
                  {order.customer.email}
                </td>
                <td>{order.customer.address}, {order.customer.city}, {order.customer.state} - {order.customer.zip}</td>
                <td>{order.paymentMethod.toUpperCase()}</td>
                <td>₹{order.total}</td>
                <td>
                  <select
                    className="status-select"
                    value={order.status || 'pending'}
                    disabled={updatingOrderId === order._id}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <table className="order-items-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>₹{item.price}</td>
                          <td>₹{item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Order;
