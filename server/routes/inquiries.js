const express = require('express');
const router = express.Router();
const { readJSONFile, writeJSONFile, generateId } = require('../utils/fileOperations');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sanitizeBody, validateEmail } = require('../middleware/sanitize');
const { containsMaliciousContent } = require('../utils/sanitize');
const { inquiryLimiter } = require('../middleware/rateLimiter');
const { paginate } = require('../utils/paginate');
const { recordChange } = require('../utils/auditTrail');
const logActivity = require('../middleware/logger');

// Check for duplicate inquiries within last 7 days
const checkDuplicate = (inquiries, email, propertyId) => {
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  return inquiries.find(inq => 
    inq.email === email && 
    inq.propertyId === propertyId &&
    new Date(inq.createdAt).getTime() > sevenDaysAgo &&
    inq.status !== 'closed' &&
    inq.status !== 'cancelled'
  );
};

// GET all inquiries (protected, paginated)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const inquiries = await readJSONFile('inquiries.json');
    
    // Filter by agent if not admin
    let filteredInquiries = inquiries;
    if (req.user.role === 'agent') {
      filteredInquiries = inquiries.filter(i => i.assignedTo === req.user.id);
    }
    
    const result = paginate(filteredInquiries, page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// GET single inquiry (protected)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const inquiries = await readJSONFile('inquiries.json');
    const inquiry = inquiries.find(i => i.id === req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    
    // Check access rights
    if (req.user.role === 'agent' && inquiry.assignedTo !== req.user.id) {
      return res.status(403).json({ error: 'Access denied to this inquiry' });
    }
    
    res.json(inquiry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inquiry' });
  }
});

// POST new inquiry (public with rate limiting and sanitization)
router.post('/', sanitizeBody, inquiryLimiter, async (req, res) => {
  try {
    // Check for XSS content
    const fieldsToCheck = [req.body.name, req.body.message];
    if (fieldsToCheck.some(field => containsMaliciousContent(field))) {
      await logActivity('XSS_ATTEMPT', `XSS attempt detected in inquiry from ${req.body.email}`, 'System');
      return res.status(400).json({ error: 'Invalid content detected. Please remove any script tags or event handlers.' });
    }
    
    // Validate email
    if (!validateEmail(req.body.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const inquiries = await readJSONFile('inquiries.json');
    
    // Check for duplicate inquiry
    const duplicate = checkDuplicate(inquiries, req.body.email, req.body.propertyId);
    if (duplicate) {
      await logActivity('DUPLICATE_INQUIRY', `Duplicate inquiry attempt: ${req.body.email} for property ${req.body.propertyId}`, 'System');
      return res.status(409).json({ 
        error: 'You have already submitted an inquiry for this property.',
        existingTicket: duplicate.ticketNumber,
        submittedAt: duplicate.createdAt
      });
    }
    
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
    await writeJSONFile('inquiries.json', inquiries);
    
    // Also add to new-inquiries tracking
    try {
      const newInquiries = await readJSONFile('new-inquiries.json');
      newInquiries.push({
        id: newInquiry.id,
        ticketNumber: newInquiry.ticketNumber,
        name: newInquiry.name,
        propertyTitle: newInquiry.propertyTitle,
        createdAt: newInquiry.createdAt
      });
      await writeJSONFile('new-inquiries.json', newInquiries);
    } catch (e) {
      console.error('Failed to update new-inquiries tracking:', e);
    }
    
    await logActivity('CREATE_INQUIRY', `New inquiry from: ${newInquiry.name} (${ticketNumber})`, 'Customer');
    
    res.status(201).json(newInquiry);
  } catch (error) {
    console.error('Failed to create inquiry:', error);
    res.status(500).json({ error: 'Failed to create inquiry' });
  }
});

// PUT update inquiry (protected, with audit trail)
router.put('/:id', authenticateToken, sanitizeBody, async (req, res) => {
  try {
    const inquiries = await readJSONFile('inquiries.json');
    const index = inquiries.findIndex(i => i.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    
    const oldInquiry = { ...inquiries[index] };
    
    // Check access rights for agents
    if (req.user.role === 'agent' && oldInquiry.assignedTo !== req.user.id) {
      return res.status(403).json({ error: 'Access denied to this inquiry' });
    }
    
    // Track changes for audit trail
    if (req.body.status && req.body.status !== oldInquiry.status) {
      recordChange(inquiries[index], 'status', oldInquiry.status, req.body.status, req.user.id, req.user.name);
    }
    if (req.body.assignedTo && req.body.assignedTo !== oldInquiry.assignedTo) {
      recordChange(inquiries[index], 'assignedTo', oldInquiry.assignedTo, req.body.assignedTo, req.user.id, req.user.name);
    }
    
    inquiries[index] = {
      ...inquiries[index],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    
    await writeJSONFile('inquiries.json', inquiries);
    
    await logActivity('UPDATE_INQUIRY', `Updated inquiry: ${inquiries[index].ticketNumber}`, req.user.name);
    
    res.json(inquiries[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
});

// DELETE inquiry (protected, admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const inquiries = await readJSONFile('inquiries.json');
    const index = inquiries.findIndex(i => i.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    
    const deletedInquiry = inquiries.splice(index, 1)[0];
    await writeJSONFile('inquiries.json', inquiries);
    
    await logActivity('DELETE_INQUIRY', `Deleted inquiry: ${deletedInquiry.ticketNumber}`, req.user.name);
    
    res.json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete inquiry' });
  }
});

// POST claim inquiry (agent self-service, protected)
router.post('/:id/claim', authenticateToken, requireRole(['agent']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const inquiries = await readJSONFile('inquiries.json');
    const inquiry = inquiries.find(i => i.id === id);
    
    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    
    if (inquiry.assignedTo) {
      return res.status(409).json({ error: 'Ticket already claimed by another agent' });
    }
    
    // Track change for audit trail
    recordChange(inquiry, 'assignedTo', null, req.user.id, req.user.id, req.user.name, 'Agent claimed ticket');
    recordChange(inquiry, 'status', inquiry.status, 'claimed', req.user.id, req.user.name);
    
    inquiry.assignedTo = req.user.id;
    inquiry.claimedBy = req.user.id;
    inquiry.claimedAt = new Date().toISOString();
    inquiry.status = 'claimed';
    inquiry.updatedAt = new Date().toISOString();
    
    await writeJSONFile('inquiries.json', inquiries);
    await logActivity('CLAIM_INQUIRY', `Agent ${req.user.name} claimed inquiry ${inquiry.ticketNumber}`, req.user.name);
    
    res.json(inquiry);
  } catch (error) {
    console.error('Failed to claim inquiry:', error);
    res.status(500).json({ error: 'Failed to claim inquiry' });
  }
});

// POST assign inquiry (admin, protected)
router.post('/:id/assign', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId, agentName } = req.body;
    
    const inquiries = await readJSONFile('inquiries.json');
    const inquiry = inquiries.find(i => i.id === id);
    
    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    
    // Track changes for audit trail
    recordChange(inquiry, 'assignedTo', inquiry.assignedTo, agentId, req.user.id, req.user.name, `Assigned to ${agentName}`);
    recordChange(inquiry, 'status', inquiry.status, 'assigned', req.user.id, req.user.name);
    
    inquiry.assignedTo = agentId;
    inquiry.assignedBy = req.user.id;
    inquiry.assignedAt = new Date().toISOString();
    inquiry.status = 'assigned';
    inquiry.updatedAt = new Date().toISOString();
    
    await writeJSONFile('inquiries.json', inquiries);
    await logActivity('ASSIGN_INQUIRY', `Admin ${req.user.name} assigned inquiry ${inquiry.ticketNumber} to ${agentName}`, req.user.name);
    
    res.json(inquiry);
  } catch (error) {
    console.error('Failed to assign inquiry:', error);
    res.status(500).json({ error: 'Failed to assign inquiry' });
  }
});

// GET agent workload (protected)
router.get('/agents/workload', authenticateToken, async (req, res) => {
  try {
    const inquiries = await readJSONFile('inquiries.json');
    const users = await readJSONFile('users.json');
    
    const agents = users.filter(u => u.role === 'agent');
    
    const workload = agents.map(agent => ({
      agentId: agent.id,
      agentName: agent.name,
      activeInquiries: inquiries.filter(i => 
        i.assignedTo === agent.id && 
        i.status !== 'closed' && 
        i.status !== 'cancelled'
      ).length,
      totalInquiries: inquiries.filter(i => i.assignedTo === agent.id).length,
      successfulInquiries: inquiries.filter(i => 
        i.assignedTo === agent.id && 
        i.status === 'successful'
      ).length
    }));
    
    res.json(workload);
  } catch (error) {
    console.error('Failed to get agent workload:', error);
    res.status(500).json({ error: 'Failed to get agent workload' });
  }
});

module.exports = router;
