const express = require('express');
const router = express.Router();
const { readJSONFile } = require('../utils/fileOperations');
const logActivity = require('../middleware/logger');

// POST login
router.post('/', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const users = readJSONFile('users.json');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      logActivity('LOGIN_FAILED', `Failed login attempt: ${email}`, 'Unknown');
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    logActivity('LOGIN_SUCCESS', `User logged in: ${user.name}`, user.name);
    
    // Don't send password back
    const { password: _, ...safeUser } = user;
    res.json({
      user: safeUser,
      message: 'Login successful'
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
