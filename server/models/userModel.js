// Import required packages
const mongoose = require('mongoose');

// Define the schema for the user data using Mongoose
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  userType: String
});

// Create a Mongoose model called "UserModel" based on the userSchema
const UserModel = mongoose.model('users', userSchema);

module.exports = UserModel;
