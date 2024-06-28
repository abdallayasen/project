import React, { useState } from 'react';
import axios from 'axios';
import './SignUp.css';

const SignUp = ({ onClose }) => {
  const [name, setName] = useState('');
  const [passportID, setPassportID] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [confirmationPassword, setConfirmationPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !userType || !name || !passportID || !phone) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (
      (userType === 'manager' && confirmationPassword !== '0000') ||
      (userType === 'employee_office' && confirmationPassword !== '1111') ||
      (userType === 'field_worker' && confirmationPassword !== '2222')
    ) {
      setErrorMessage('Incorrect confirmation password. Please try again.');
      return;
    }

    try {
      if (userType === 'customer') {
        const response = await axios.post('http://localhost:8000/addCustomer', {
          name,
          passportID,
          phone,
          email,
        });
        console.log('Customer added:', response.data);
        alert('Customer successfully added!');
      } else {
        const response = await axios.post('http://localhost:8000/addUser', {
          name,
          passportID,
          phone,
          email,
          password,
          userType,
          address,
          city,
          startDate,
          endDate,
        });
        console.log('User added:', response.data);
        alert('User successfully added!');
      }
      setName('');
      setPassportID('');
      setPhone('');
      setEmail('');
      setPassword('');
      setUserType('');
      setConfirmationPassword('');
      setAddress('');
      setCity('');
      setStartDate('');
      setEndDate('');
      setErrorMessage('');
      onClose();
    } catch (error) {
      console.error('Error adding user:', error);
      setErrorMessage('Error adding user. Please try again.');
    }
  };

  return (
    <div className="modal active">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Sign Up</h2>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Passport ID:</label>
            <input
              type="text"
              value={passportID}
              onChange={(e) => setPassportID(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number:</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>User Type:</label>
            <select value={userType} onChange={handleUserTypeChange} required>
              <option value="">Select User Type</option>
              <option value="customer">Customer</option>
              <option value="manager">Manager</option>
              <option value="employee_office">Employee Office</option>
              <option value="field_worker">Field Worker</option>
            </select>
          </div>
          {(userType === 'manager' || userType === 'employee_office' || userType === 'field_worker') && (
            <>
              <div className="form-group">
                <label>Confirmation Password:</label>
                <input
                  type="password"
                  value={confirmationPassword}
                  onChange={(e) => setConfirmationPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>City:</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          <button type="submit">OK</button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
