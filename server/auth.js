const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { createToken } = require('./utils/token');

const router = express.Router();
const usersPath = path.join(__dirname, 'data', 'users.json');

// Ensure users.json exists
if (!fs.existsSync(usersPath)) {
  fs.writeFileSync(usersPath, '[]');
}

// Register Route
router.post('/register', async (req, res) => {
  try {
    // Log the raw request body
    let rawBody = '';
    req.on('data', chunk => {
      rawBody += chunk.toString();
    });
    req.on('end', () => {
      console.log('Raw request body:', rawBody);
    });

    console.log('Request body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Read users data from the file
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

    // Check if the email already exists
    const exists = users.find(u => u.email === email);
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    // Hash the password before storing
    const hashed = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = { id: Date.now(), email, password: hashed };

    // Save the new user in the users list
    users.push(newUser);
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    // Generate a JWT token
    const token = createToken(newUser.id);

    // Send the token back to the client
    res.json({ token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    // Log the raw request body
    let rawBody = '';
    req.on('data', chunk => {
      rawBody += chunk.toString();
    });
    req.on('end', () => {
      console.log('Raw request body:', rawBody);
    });

    console.log('Request body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Read users data from the file
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

    // Check if the user exists by email
    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    // Compare the provided password with the hashed password in the database
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid email or password' });

    // Generate a JWT token
    const token = createToken(user.id);

    // Send the token back to the client
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
