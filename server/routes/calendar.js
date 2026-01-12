const express = require('express');
const router = express.Router();
const { readJSONFile, writeJSONFile, generateId } = require('../utils/fileOperations');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sanitizeBody } = require('../middleware/sanitize');
const { paginate } = require('../utils/paginate');
const logActivity = require('../middleware/logger');

// GET all calendar events (protected, paginated)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const events = await readJSONFile('calendar-events.json');
    
    // Filter by agent if not admin
    let filteredEvents = events;
    if (req.user.role === 'agent') {
      filteredEvents = events.filter(e => e.agentId === req.user.id);
    }
    
    const result = paginate(filteredEvents, page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// GET events for specific agent (protected)
router.get('/agent/:agentId', authenticateToken, async (req, res) => {
  try {
    // Agents can only view their own events, admins can view any
    if (req.user.role === 'agent' && req.params.agentId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const events = await readJSONFile('calendar-events.json');
    const agentEvents = events.filter(e => e.agentId === req.params.agentId);
    res.json(agentEvents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch agent events' });
  }
});

// POST new event (protected)
router.post('/', authenticateToken, sanitizeBody, async (req, res) => {
  try {
    const { start, end, agentId } = req.body;
    
    // Agents can only create events for themselves
    if (req.user.role === 'agent' && agentId !== req.user.id) {
      return res.status(403).json({ error: 'Cannot create events for other agents' });
    }
    
    const events = await readJSONFile('calendar-events.json');
    
    // Check for conflicts (30-minute buffer)
    const buffer = 30 * 60 * 1000; // 30 minutes in milliseconds
    const newStart = new Date(start).getTime();
    const newEnd = new Date(end).getTime();
    
    const hasConflict = events.some(event => {
      if (event.agentId !== agentId) return false;
      
      const eventStart = new Date(event.start).getTime();
      const eventEnd = new Date(event.end).getTime();
      
      // Check if there's overlap with 30-minute buffer
      return (newStart < eventEnd + buffer) && (newEnd > eventStart - buffer);
    });
    
    if (hasConflict) {
      return res.status(409).json({ 
        error: 'Schedule conflict: You have another event within 30 minutes of this time' 
      });
    }
    
    const newEvent = {
      id: generateId(),
      ...req.body,
      createdBy: req.user.name,
      createdAt: new Date().toISOString()
    };
    
    events.push(newEvent);
    await writeJSONFile('calendar-events.json', events);
    
    await logActivity('CREATE_EVENT', `Created calendar event: ${newEvent.title}`, req.user.name);
    
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Failed to create event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT update event (protected)
router.put('/:id', authenticateToken, sanitizeBody, async (req, res) => {
  try {
    const events = await readJSONFile('calendar-events.json');
    const index = events.findIndex(e => e.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check access rights
    if (req.user.role === 'agent' && events[index].agentId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    events[index] = {
      ...events[index],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    
    await writeJSONFile('calendar-events.json', events);
    
    await logActivity('UPDATE_EVENT', `Updated calendar event: ${events[index].title}`, req.user.name);
    
    res.json(events[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE event (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const events = await readJSONFile('calendar-events.json');
    const index = events.findIndex(e => e.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check access rights
    if (req.user.role === 'agent' && events[index].agentId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const deletedEvent = events.splice(index, 1)[0];
    await writeJSONFile('calendar-events.json', events);
    
    await logActivity('DELETE_EVENT', `Deleted calendar event: ${deletedEvent.title}`, req.user.name);
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;
