import React, { useState } from 'react';
import axios from 'axios';

const Support = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    try {
      // Adjust the endpoint URL to match your backend server route
      const response = await axios.post('http://localhost:5000/api/support', formData);
      
      if (response.status === 200) {
        setStatus('Your support request has been submitted successfully!');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        });
      }
    } catch (error) {
      console.error('Error submitting support request:', error);
      setStatus('Failed to submit the request. Please try again later.');
    }
  };

  return (
    <div style={{ padding: '20px', marginTop: '80px', backgroundColor: '#fff', minHeight: '100vh' }}>
      <h2>Support Request Form</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '600px' }}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your Name"
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your Email"
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Subject"
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Your Message"
          required
          rows="5"
          style={{ padding: '10px', fontSize: '16px' }}
        ></textarea>
        <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Submit
        </button>
      </form>
      {status && <p style={{ marginTop: '20px', color: status.includes('successfully') ? 'green' : 'red' }}>{status}</p>}
    </div>
  );
};

export default Support;
