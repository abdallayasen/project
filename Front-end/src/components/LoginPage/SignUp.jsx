import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, MenuItem, Select } from '@mui/material';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import { useTheme } from '@mui/material';
import { tokens } from '../../theme';  // Assuming tokens are defined in your theme

// Import Firebase Database Functions
import { getDatabase, ref, get, query, orderByChild, equalTo } from 'firebase/database';

const SignUp = ({ open, onClose }) => {
  const [name, setName] = useState('');
  const [passportId, setPassportId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationPassword, setConfirmationPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);  // Get the colors based on the theme mode

  const auth = getAuth();

  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmationPassword || !userType || !name || !passportId || !phone) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password !== confirmationPassword) {
      setErrorMessage('Passwords do not match. Please try again.');
      return;
    }

    try {
      // Check if the name already exists
      const db = getDatabase();
      const usersRef = ref(db, userType === 'customer' ? 'customers' : 'users');
      const nameQuery = query(usersRef, orderByChild('name'), equalTo(name));
      const nameSnapshot = await get(nameQuery);

      if (nameSnapshot.exists()) {
        setErrorMessage('This name is already in use. Please choose a different name.');
        return;
      }

      // Proceed with creating the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userData = {
        name,
        passportId,
        phone,
        email,
        userType,
        address,
        city,
        startDate,
        endDate: '', // End date not shown in the form but will be stored in the database
      };

      if (userType === 'customer') {
        await axios.post('http://localhost:8000/addCustomer', userData);
        alert('Customer successfully added!');
      } else {
        await axios.post('http://localhost:8000/addUser', userData);
        alert('User successfully added!');
      }

      // Reset form and close the modal
      setName('');
      setPassportId('');
      setPhone('');
      setEmail('');
      setPassword('');
      setConfirmationPassword('');
      setUserType('');
      setAddress('');
      setCity('');
      setStartDate('');
      setErrorMessage('');
      onClose();
    } catch (error) {
      console.error('Error adding user:', error);

      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('This email is already in use. Please use a different email address.');
      } else {
        setErrorMessage('Error adding user. Please try again.');
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ style: { borderRadius: 10, maxWidth: '900px', backgroundColor: colors.primary[400] } }}>
      <DialogTitle sx={{ backgroundColor: colors.greenAccent[600], textAlign: 'center', fontSize: '24px' }}>
        Sign Up
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: colors.primary[400], color: colors.grey[100] }} dividers>
        {errorMessage && <Typography color="error" align="center">{errorMessage}</Typography>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
            required
            InputLabelProps={{
              style: { color: colors.grey[100] },
            }}
            InputProps={{
              style: { color: colors.grey[100] },
            }}
          />
          <TextField
            label="Passport ID"
            variant="outlined"
            fullWidth
            value={passportId}
            onChange={(e) => setPassportId(e.target.value)}
            sx={{ mb: 2 }}
            required
            InputLabelProps={{
              style: { color: colors.grey[100] },
            }}
            InputProps={{
              style: { color: colors.grey[100] },
            }}
          />
          <TextField
            label="Phone Number"
            variant="outlined"
            fullWidth
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            sx={{ mb: 2 }}
            required
            InputLabelProps={{
              style: { color: colors.grey[100] },
            }}
            InputProps={{
              style: { color: colors.grey[100] },
            }}
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            required
            InputLabelProps={{
              style: { color: colors.grey[100] },
            }}
            InputProps={{
              style: { color: colors.grey[100] },
            }}
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
            required
            InputLabelProps={{
              style: { color: colors.grey[100] },
            }}
            InputProps={{
              style: { color: colors.grey[100] },
            }}
          />
          <TextField
            label="Confirm Password"
            variant="outlined"
            type="password"
            fullWidth
            value={confirmationPassword}
            onChange={(e) => setConfirmationPassword(e.target.value)}
            sx={{ mb: 2 }}
            required
            InputLabelProps={{
              style: { color: colors.grey[100] },
            }}
            InputProps={{
              style: { color: colors.grey[100] },
            }}
          />
          <Select
            label="User Type"
            value={userType}
            onChange={handleUserTypeChange}
            fullWidth
            required
            sx={{ mb: 2, color: colors.grey[100] }}
            displayEmpty
          >
            <MenuItem value="" disabled>Select User Type</MenuItem>
            {/* <MenuItem value="customer">Customer</MenuItem> */}
            <MenuItem value="employee_office">Employee Office</MenuItem>
            <MenuItem value="field_worker">Field Worker</MenuItem>
          </Select>
          {(userType === 'employee_office' || userType === 'field_worker') && (
            <>
              <TextField
                label="Address"
                variant="outlined"
                fullWidth
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                sx={{ mb: 2 }}
                required
                InputLabelProps={{
                  style: { color: colors.grey[100] },
                }}
                InputProps={{
                  style: { color: colors.grey[100] },
                }}
              />
              <TextField
                label="City"
                variant="outlined"
                fullWidth
                value={city}
                onChange={(e) => setCity(e.target.value)}
                sx={{ mb: 2 }}
                required
                InputLabelProps={{
                  style: { color: colors.grey[100] },
                }}
                InputProps={{
                  style: { color: colors.grey[100] },
                }}
              />
              <TextField
                label="Start Date"
                variant="outlined"
                type="date"
                fullWidth
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                sx={{ mb: 2 }}
                InputLabelProps={{
                  shrink: true,
                  style: { color: colors.grey[100] },
                }}
                InputProps={{
                  style: { color: colors.grey[100] },
                }}
                required
              />
            </>
          )}
        </form>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: colors.primary[400] }}>
        <Button onClick={onClose} sx={{ backgroundColor: colors.redAccent[500], color: colors.grey[100] }}>
          Close
        </Button>
        <Button onClick={handleSubmit} sx={{ backgroundColor: colors.greenAccent[500], color: colors.grey[100] }}>
          Sign Up
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignUp;
