// server/index.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./api/userRoutes');
const customerRoutes = require('./api/customerRoutes'); // Assuming you have customerRoutes defined

// Load environment variables from .env file
dotenv.config();

// Create an Express app
const app = express();

// Use CORS middleware
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Set the port from environment variables or default to 8000
const PORT = process.env.PORT || 8000;

// Use userRoutes for handling user-related requests
app.use('/', userRoutes);
app.use('/', customerRoutes); // Ensure this route file is defined

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
