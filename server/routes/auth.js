const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { readJSONFile } = require('../utils/fileOperations');
const { generateToken } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');
const logActivity = require('../middleware/logger');

// POST login with bcrypt and JWT
router.post('/', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const users = await readJSONFile('users.json');
    const user = users.find(u => u.email === email);
    
    if (!user) {
      await logActivity('LOGIN_FAILED', `Failed login attempt: ${email}`, 'Unknown');
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Compare password with bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      await logActivity('LOGIN_FAILED', `Failed login attempt: ${email}`, 'Unknown');
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    await logActivity('LOGIN_SUCCESS', `User logged in: ${user.name}`, user.name);
    
    // Don't send password back
    const { password: _, ...safeUser } = user;
    res.json({
      user: safeUser,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
