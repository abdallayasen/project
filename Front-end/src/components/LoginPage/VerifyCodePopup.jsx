import React, { useState } from 'react';

const VerifyCodePopup = ({ email, onConfirmCode, onClose }) => {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState(null);

  const handleConfirmCode = () => {
    // Assume a function that validates the code
    const validCode = "12345";  // For demo purposes, hardcode the valid code

    if (code === validCode) {
      onConfirmCode();  // Proceed to the next step
    } else {
      setMessage("Invalid code. Please try again.");
    }
  };

  return (
    <div className="popup">
      <h3>Verify Code</h3>
      <p>We sent a 5-digit code to {email}</p>
      <input
        type="text"
        placeholder="Enter the code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={handleConfirmCode}>Confirm Code</button>
      {message && <p>{message}</p>}
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default VerifyCodePopup;
