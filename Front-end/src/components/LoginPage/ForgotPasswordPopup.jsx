import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, useTheme, Box } from '@mui/material';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { tokens } from '../../theme';

const ForgotPasswordPopup = ({ open, onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false); // Track if email has been sent
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const auth = getAuth();

  const handleSendResetEmail = () => {
    if (!email) {
      setError('Please enter your email.');
      return;
    }

    // Send the password reset email via Firebase
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setMessage(`Password reset email sent to ${email}`);
        setEmailSent(true); // Mark that email has been sent
        setError('');
      })
      .catch((err) => {
        setError('Error sending reset email. Make sure the email is correct.');
        setMessage('');
      });
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ style: { borderRadius: 20, padding: '20px', maxWidth: '450px' } }}>
      <DialogTitle>
        <Typography variant="h5" align="center" style={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
          Forgot Password
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" alignItems="center">
          {!emailSent ? (
            <>
              <Typography variant="body1" color="textSecondary" align="center" style={{ marginBottom: '20px' }}>
                Enter your email below, and we will send you a link to reset your password.
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
          ) : (
            <Typography variant="body1" color="textSecondary" align="center" style={{ marginBottom: '20px' }}>
              {message}
            </Typography>
          )}

          {error && <Typography color="red" align="center">{error}</Typography>}
        </Box>
      </DialogContent>
      <DialogActions>
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
          Close
        </Button>
        {!emailSent && (
          <Button
            onClick={handleSendResetEmail}
            sx={{
              backgroundColor: colors.greenAccent[600],
              color: 'white',
              borderRadius: '20px',
              padding: '10px 20px',
              '&:hover': { backgroundColor: colors.greenAccent[400] },
            }}
          >
            Send Reset Email
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPasswordPopup;
