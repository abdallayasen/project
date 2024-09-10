import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, useTheme, Box } from '@mui/material';
import axios from 'axios'; // For making requests to the backend
import { tokens } from '../../theme';

const ForgotPasswordPopup = ({ open, onClose }) => {
  const [email, setEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [step, setStep] = useState(1); // Step 1: Email input, Step 2: Code input
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleSendResetCode = async () => {
    try {
      // Call the backend route to send the reset code
      const response = await axios.post('/send-reset-code', { email });
      setMessage(response.data.message);
      setError('');
      setStep(2); // Move to step 2 for code input
    } catch (err) {
      setError(err.response.data.message || 'Error sending reset code');
    }
  };

  const handleVerifyCode = () => {
    // Here, you would verify the code entered by the user with the one in the Firebase database
    if (confirmationCode === 'expected-code-from-db') {
      setMessage('Code verified! You can now reset your password.');
      // Move to password reset step (if needed)
    } else {
      setError('Invalid code. Please try again.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ style: { borderRadius: 20, padding: '20px', maxWidth: '450px' } }}>
      <DialogTitle>
        <Typography variant="h5" align="center" style={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
          {step === 1 ? 'Forgot Password' : 'Enter Confirmation Code'}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" alignItems="center">
          {step === 1 && (
            <>
              <Typography variant="body1" color="textSecondary" align="center" style={{ marginBottom: '20px' }}>
                Enter your email below, and we will send you a code to reset your password.
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                id="email"
                label="Email Address"
                type="email"
                fullWidth
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  style: {
                    backgroundColor: colors.primary[400],
                    borderRadius: '8px',
                    color: '#fff',
                  },
                }}
                InputLabelProps={{
                  style: {
                    color: colors.grey[300],
                  },
                }}
                sx={{ marginBottom: '15px' }}
              />
            </>
          )}
          {step === 2 && (
            <>
              <Typography variant="body1" color="textSecondary" align="center" style={{ marginBottom: '20px' }}>
                A confirmation code has been sent to your email. Please enter the code below.
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                id="confirmationCode"
                label="Confirmation Code"
                type="text"
                fullWidth
                variant="outlined"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                InputProps={{
                  style: {
                    backgroundColor: colors.primary[400],
                    borderRadius: '8px',
                    color: '#fff',
                  },
                }}
                InputLabelProps={{
                  style: {
                    color: colors.grey[300],
                  },
                }}
                sx={{ marginBottom: '15px' }}
              />
            </>
          )}
          {message && <Typography color="green" align="center">{message}</Typography>}
          {error && <Typography color="red" align="center">{error}</Typography>}
        </Box>
      </DialogContent>
      <DialogActions>
        {step === 1 ? (
          <>
            <Button
              onClick={onClose}
              sx={{
                backgroundColor: colors.redAccent[600],
                color: 'white',
                borderRadius: '20px',
                padding: '10px 20px',
                '&:hover': { backgroundColor: colors.redAccent[400] },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendResetCode}
              sx={{
                backgroundColor: colors.greenAccent[600],
                color: 'white',
                borderRadius: '20px',
                padding: '10px 20px',
                '&:hover': { backgroundColor: colors.greenAccent[400] },
              }}
            >
              Send Reset Code
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={onClose}
              sx={{
                backgroundColor: colors.redAccent[600],
                color: 'white',
                borderRadius: '20px',
                padding: '10px 20px',
                '&:hover': { backgroundColor: colors.redAccent[400] },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerifyCode}
              sx={{
                backgroundColor: colors.greenAccent[600],
                color: 'white',
                borderRadius: '20px',
                padding: '10px 20px',
                '&:hover': { backgroundColor: colors.greenAccent[400] },
              }}
            >
              Verify Code
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPasswordPopup;
