const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Create User
router.post('/createUser', userController.createUser);

// Get All Users
router.get('/getAllUsers', userController.getAllUsers);

// Get a user by ID
router.get('/getUserById/:id', userController.getUserById);

// Update a user by ID
router.post('/updateUser/:id', userController.updateUser);

// Delete a user by ID
router.post('/deleteUser/:id', userController.deleteUser);

// User Login
router.post('/login', userController.loginUser);

module.exports = router;
