const express = require('express');
const router = express.Router();
const { readJSONFile, writeJSONFile, generateId } = require('../utils/fileOperations');
const logActivity = require('../middleware/logger');

// GET all calendar events
router.get('/', (req, res) => {
  try {
    const events = readJSONFile('calendar-events.json');
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// GET events for specific agent
router.get('/agent/:agentId', (req, res) => {
  try {
    const events = readJSONFile('calendar-events.json');
    const agentEvents = events.filter(e => e.agentId === req.params.agentId);
    res.json(agentEvents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch agent events' });
  }
});

// POST new event
router.post('/', (req, res) => {
  try {
    const { start, end, agentId } = req.body;
    const events = readJSONFile('calendar-events.json');
    
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
      createdAt: new Date().toISOString()
    };
    
    events.push(newEvent);
    writeJSONFile('calendar-events.json', events);
    
    logActivity('CREATE_EVENT', `Created calendar event: ${newEvent.title}`, req.body.user);
    
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Failed to create event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT update event
router.put('/:id', (req, res) => {
  try {
    const events = readJSONFile('calendar-events.json');
    const index = events.findIndex(e => e.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    events[index] = {
      ...events[index],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    
    writeJSONFile('calendar-events.json', events);
    
    logActivity('UPDATE_EVENT', `Updated calendar event: ${events[index].title}`, req.body.user);
    
    res.json(events[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE event
router.delete('/:id', (req, res) => {
  try {
    const events = readJSONFile('calendar-events.json');
    const index = events.findIndex(e => e.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const deletedEvent = events.splice(index, 1)[0];
    writeJSONFile('calendar-events.json', events);
    
    logActivity('DELETE_EVENT', `Deleted calendar event: ${deletedEvent.title}`, req.query.user);
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;
