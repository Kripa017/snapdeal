import React, { useState, useEffect } from 'react';
import './manageusers.css';

function Manageusers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    
    fetch('/api/users', { headers })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsers(data.users);
        } else {
          console.warn('Unable to load users:', data.error);
        }
      })
      .catch(err => console.error('Error fetching users:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>Loading users.</p>;
  }

  if (!users.length) {
    return <p>No users found.</p>;
  }

  return (
    <div>
      <h2>Manage Users</h2>
      <table id="userTable">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Date Joined</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody id="tableBody">
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}</td>
              <td>{u.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Manageusers;




