import React, { useState } from 'react';
import { getAuth, updatePassword } from 'firebase/auth';

const ResetPasswordPopup = ({ onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const auth = getAuth();

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const user = auth.currentUser;
      await updatePassword(user, newPassword);
      setMessage("Password changed successfully!");
    } catch (error) {
      setMessage("Error changing password. Please try again.");
    }
  };

  return (
    <div className="popup">
      <h3>Set New Password</h3>
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button onClick={handleChangePassword}>Change Password</button>
      {message && <p>{message}</p>}
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default ResetPasswordPopup;
