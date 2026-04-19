import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Users () {
    const [users, setUsers] = useState([])
        
      
     useEffect(() => {
        axios.get("http://localhost:3001")
        .then(result => setUsers(result.data))
        .catch(err => console.log(err))
     }, [])





    return (
        <div className="d-flex vh-100 bg-primary justify-content-center align-items-center">
            <div className="w-50 bg-white rounded p-3">
                <div className="d-flex justify-content-between mb-3">
                    <h4>Users</h4>
                    <Link to="/create" className="btn btn-success">Add +</Link>
                </div>

                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, idx) => (
                            <tr key={idx}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.phone}</td>
                                <td>
                                    <Link to={`/update/${user._id}`} className="btn btn-success ">Edit</Link>
                                    <button className="btn btn-danger">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Users;