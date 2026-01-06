const express = require('express');
const router = express.Router();
const { readJSONFile, writeJSONFile, generateId } = require('../utils/fileOperations');
const logActivity = require('../middleware/logger');

// GET all inquiries
router.get('/', (req, res) => {
  try {
    const inquiries = readJSONFile('inquiries.json');
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// GET single inquiry
router.get('/:id', (req, res) => {
  try {
    const inquiries = readJSONFile('inquiries.json');
    const inquiry = inquiries.find(i => i.id === req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    
    res.json(inquiry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inquiry' });
  }
});

// POST new inquiry
router.post('/', (req, res) => {
  try {
    const inquiries = readJSONFile('inquiries.json');
    const newInquiry = {
      id: generateId(),
      ...req.body,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    inquiries.push(newInquiry);
    writeJSONFile('inquiries.json', inquiries);
    
    logActivity('CREATE_INQUIRY', `New inquiry from: ${newInquiry.name}`, 'Customer');
    
    res.status(201).json(newInquiry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create inquiry' });
  }
});

// PUT update inquiry
router.put('/:id', (req, res) => {
  try {
    const inquiries = readJSONFile('inquiries.json');
    const index = inquiries.findIndex(i => i.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    
    inquiries[index] = {
      ...inquiries[index],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    
    writeJSONFile('inquiries.json', inquiries);
    
    logActivity('UPDATE_INQUIRY', `Updated inquiry: ${inquiries[index].id}`, req.body.user);
    
    res.json(inquiries[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
});

// DELETE inquiry
router.delete('/:id', (req, res) => {
  try {
    const inquiries = readJSONFile('inquiries.json');
    const index = inquiries.findIndex(i => i.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    
    inquiries.splice(index, 1);
    writeJSONFile('inquiries.json', inquiries);
    
    logActivity('DELETE_INQUIRY', `Deleted inquiry: ${req.params.id}`, req.query.user);
    
    res.json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete inquiry' });
  }
});

module.exports = router;
