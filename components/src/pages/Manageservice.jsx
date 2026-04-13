import React, { useState, useEffect } from 'react';
import { getFullApiPath } from '../api';
import './manageservice.css';

const Manageservice = () => {
    const [uploadedImages, setUploadedImages] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    
    const fetchImages = async () => {
        try {
            const res = await fetch(getFullApiPath('/images'));
            const data = await res.json();

            if (data.success) {
                setUploadedImages(data.images);
            }
        } catch (err) {
            console.error("Error fetching images:", err);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    
    const handleUploadClick = async () => {
    if (!selectedFile) {
        alert('Please select an image first!');
        return;
    }

    try {
        const formData = new FormData();
        formData.append("image", selectedFile);

        const res = await fetch(getFullApiPath('/upload'), {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        console.log("Server response:", data);

        if (!data.success) {
            throw new Error(data.error || "Upload failed");
        }

        alert("Upload successful!");
        fetchImages(); 
    } catch (err) {
        console.error("Upload error:", err);
        alert("Upload failed: " + err.message);
    }
};

    
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this image?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(getFullApiPath(`/images/${id}`), {
                method: "DELETE"
            });

            const data = await res.json();

            if (data.success) {
                alert("Image deleted successfully!");
                fetchImages();
            }
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    return (
        <div>
            <h2>Manage Services</h2>

            
            <div className="upload-section">
                <h3>Upload Image to Dashboard</h3>

                <div className="upload-container">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="file-input"
                    />

                    <button className="upload-btn" onClick={handleUploadClick}>
                        Upload Image
                    </button>
                </div>
            </div>

            
            <h3>Uploaded Images</h3>

            <div className="image-list">
                {uploadedImages.map((img) => (
                    <div key={img._id} className="image-item">
                        <img src={img.imageUrl} alt="uploaded" width="150" />

                        <p>{new Date(img.createdAt).toLocaleString()}</p>

                        <button onClick={() => handleDelete(img._id)}>
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Manageservice;