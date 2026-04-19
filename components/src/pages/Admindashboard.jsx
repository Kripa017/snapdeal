import React from 'react';
import { useNavigate } from 'react-router-dom';
import './admindashboard.css';


const Admindashboard = () => {
  const navigate = useNavigate();
  
  const rows = [];

  const goToAddProduct = () => {
    navigate('/addproduct');
  };

  return (
    <>
      <div className="header">Admin Dashboard</div>
      <div className="container">
        <div className="dashboard-boxes">
          <div className="box">
            <h4>Add Product</h4>
            <button className="btn" onClick={goToAddProduct}>Add New</button>
          </div>
          

           <div className="box">
            <h4>Manage Products</h4>
            <button className="btn" onClick={() => navigate('/manageproduct')}>View Products</button>
            </div>

            <div className="box">
            <h4>Manage Users</h4>
            <button className="btn" onClick={() =>navigate('/manageusers')}>View Users</button>
          </div>

          
          

<div className="box">
            <h4>Upload Product Form</h4>
            <button className="btn" onClick={() =>navigate('/uploadproductform')}>Upload Product Form</button>
          </div>


          <div className="box">
            <h4>Orders</h4>
            <button className="btn" onClick={() =>navigate('/order')}>View Orders</button>
          </div>


        </div>

        



        {rows.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.user}</td>
                  <td>{row.product}</td>
                  <td>{row.quantity}</td>
                  <td>{row.price}</td>
                  <td>
                    <button className="btn">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default Admindashboard;