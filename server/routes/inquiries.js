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
    
    // Generate ticket number in format INQ-2026-001
    const year = new Date().getFullYear();
    const existingTickets = inquiries.filter(i => i.ticketNumber && i.ticketNumber.startsWith(`INQ-${year}-`));
    const ticketCount = existingTickets.length + 1;
    const ticketNumber = `INQ-${year}-${String(ticketCount).padStart(3, '0')}`;
    
    const newInquiry = {
      id: generateId(),
      ticketNumber: ticketNumber,
      
      // Customer Info
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      message: req.body.message,
      
      // Property Info
      propertyId: req.body.propertyId,
      propertyTitle: req.body.propertyTitle || null,
      propertyPrice: req.body.propertyPrice || null,
      propertyLocation: req.body.propertyLocation || null,
      
      // Assignment Status
      status: 'new',
      assignedTo: null,
      claimedBy: null,
      assignedBy: null,
      claimedAt: null,
      assignedAt: null,
      
      // Communication History
      notes: [],
      
      // Follow-up System
      lastFollowUpAt: null,
      nextFollowUpAt: null,
      followUpReminders: [],
      
      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      closedAt: null
    };
    
    inquiries.push(newInquiry);
    writeJSONFile('inquiries.json', inquiries);
    
    // Also add to new-inquiries tracking
    try {
      const newInquiries = readJSONFile('new-inquiries.json');
      newInquiries.push({
        id: newInquiry.id,
        ticketNumber: newInquiry.ticketNumber,
        name: newInquiry.name,
        propertyTitle: newInquiry.propertyTitle,
        createdAt: newInquiry.createdAt
      });
      writeJSONFile('new-inquiries.json', newInquiries);
    } catch (e) {
      console.error('Failed to update new-inquiries tracking:', e);
    }
    
    logActivity('CREATE_INQUIRY', `New inquiry from: ${newInquiry.name} (${ticketNumber})`, 'Customer');
    
    res.status(201).json(newInquiry);
  } catch (error) {
    console.error('Failed to create inquiry:', error);
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
