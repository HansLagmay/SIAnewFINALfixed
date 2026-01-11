const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { readJSONFile, writeJSONFile, generateId } = require('../utils/fileOperations');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sanitizeBody, validateEmail } = require('../middleware/sanitize');
const { paginate } = require('../utils/paginate');
const logActivity = require('../middleware/logger');

const SALT_ROUNDS = 10;

// GET all users (protected, paginated)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const users = await readJSONFile('users.json');
    // Don't send passwords
    const safeUsers = users.map(({ password, ...user }) => user);
    
    const result = paginate(safeUsers, page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET agents only (protected, paginated)
router.get('/agents', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const users = await readJSONFile('users.json');
    const agents = users.filter(u => u.role === 'agent');
    const safeAgents = agents.map(({ password, ...agent }) => agent);
    
    const result = paginate(safeAgents, page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// POST create agent (protected, admin only, with password hashing)
router.post('/', authenticateToken, requireRole(['admin']), sanitizeBody, async (req, res) => {
  try {
    const users = await readJSONFile('users.json');
    const newAgents = await readJSONFile('new-agents.json');
    
    // Validate email
    if (!validateEmail(req.body.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Check if email already exists
    const existingUser = users.find(u => u.email === req.body.email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUNDS);
    
    const newAgent = {
      id: generateId(),
      email: req.body.email,
      password: hashedPassword,
      role: 'agent',
      name: req.body.name,
      phone: req.body.phone,
      employmentData: req.body.employmentData,
      createdAt: new Date().toISOString()
    };
    
    users.push(newAgent);
    newAgents.push(newAgent);
    
    await writeJSONFile('users.json', users);
    await writeJSONFile('new-agents.json', newAgents);
    
    logActivity('CREATE_AGENT', `Created new agent: ${newAgent.name}`, req.body.createdBy || 'Admin');
    
    const { password, ...safeAgent } = newAgent;
    res.status(201).json(safeAgent);
  } catch (error) {
    console.error('Failed to create agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// DELETE user (protected, admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const users = await readJSONFile('users.json');
    const index = users.findIndex(u => u.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const deletedUser = users.splice(index, 1)[0];
    await writeJSONFile('users.json', users);
    
    logActivity('DELETE_USER', `Deleted user: ${deletedUser.name}`, req.user.name);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
