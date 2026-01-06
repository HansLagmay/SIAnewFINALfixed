const express = require('express');
const router = express.Router();
const { readJSONFile, writeJSONFile, generateId } = require('../utils/fileOperations');
const logActivity = require('../middleware/logger');

// GET all properties
router.get('/', (req, res) => {
  try {
    const properties = readJSONFile('properties.json');
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// GET single property
router.get('/:id', (req, res) => {
  try {
    const properties = readJSONFile('properties.json');
    const property = properties.find(p => p.id === req.params.id);
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// POST new property
router.post('/', (req, res) => {
  try {
    const properties = readJSONFile('properties.json');
    const newProperty = {
      id: generateId(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    properties.push(newProperty);
    writeJSONFile('properties.json', properties);
    
    logActivity('CREATE_PROPERTY', `Created property: ${newProperty.title}`, req.body.user);
    
    res.status(201).json(newProperty);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// PUT update property
router.put('/:id', (req, res) => {
  try {
    const properties = readJSONFile('properties.json');
    const index = properties.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    properties[index] = {
      ...properties[index],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    
    writeJSONFile('properties.json', properties);
    
    logActivity('UPDATE_PROPERTY', `Updated property: ${properties[index].title}`, req.body.user);
    
    res.json(properties[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// DELETE property
router.delete('/:id', (req, res) => {
  try {
    const properties = readJSONFile('properties.json');
    const index = properties.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    const deletedProperty = properties.splice(index, 1)[0];
    writeJSONFile('properties.json', properties);
    
    logActivity('DELETE_PROPERTY', `Deleted property: ${deletedProperty.title}`, req.query.user);
    
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

module.exports = router;
