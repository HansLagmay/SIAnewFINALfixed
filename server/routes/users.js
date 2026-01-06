const express = require('express');
const router = express.Router();
const { readJSONFile, writeJSONFile, generateId } = require('../utils/fileOperations');
const logActivity = require('../middleware/logger');

// GET all users
router.get('/', (req, res) => {
  try {
    const users = readJSONFile('users.json');
    // Don't send passwords
    const safeUsers = users.map(({ password, ...user }) => user);
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET agents only
router.get('/agents', (req, res) => {
  try {
    const users = readJSONFile('users.json');
    const agents = users.filter(u => u.role === 'agent');
    const safeAgents = agents.map(({ password, ...agent }) => agent);
    res.json(safeAgents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// POST create agent
router.post('/', (req, res) => {
  try {
    const users = readJSONFile('users.json');
    const newAgents = readJSONFile('new-agents.json');
    
    // Check if email already exists
    const existingUser = users.find(u => u.email === req.body.email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const newAgent = {
      id: generateId(),
      email: req.body.email,
      password: req.body.password,
      role: 'agent',
      name: req.body.name,
      phone: req.body.phone,
      employmentData: req.body.employmentData,
      createdAt: new Date().toISOString()
    };
    
    users.push(newAgent);
    newAgents.push(newAgent);
    
    writeJSONFile('users.json', users);
    writeJSONFile('new-agents.json', newAgents);
    
    logActivity('CREATE_AGENT', `Created new agent: ${newAgent.name}`, req.body.createdBy || 'Admin');
    
    const { password, ...safeAgent } = newAgent;
    res.status(201).json(safeAgent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// DELETE user
router.delete('/:id', (req, res) => {
  try {
    const users = readJSONFile('users.json');
    const index = users.findIndex(u => u.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const deletedUser = users.splice(index, 1)[0];
    writeJSONFile('users.json', users);
    
    logActivity('DELETE_USER', `Deleted user: ${deletedUser.name}`, req.query.user);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
