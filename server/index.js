const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./api/userRoutes');
const customerRoutes = require('./api/customerRoutes');
const ordersRoutes = require('./api/ordersRoutes'); // Add this line

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
app.use('/', customerRoutes);
app.use('/', ordersRoutes); // Add this line

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
