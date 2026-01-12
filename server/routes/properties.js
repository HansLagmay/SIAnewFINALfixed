const express = require('express');
const router = express.Router();
const { readJSONFile, writeJSONFile, generateId } = require('../utils/fileOperations');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sanitizeBody } = require('../middleware/sanitize');
const { propertyCreationLimiter } = require('../middleware/rateLimiter');
const { paginate } = require('../utils/paginate');
const { recordChange } = require('../utils/auditTrail');
const { upload } = require('../middleware/upload');
const logActivity = require('../middleware/logger');

// GET all properties (public, paginated)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const properties = await readJSONFile('properties.json');
    const result = paginate(properties, page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// GET single property (public)
router.get('/:id', async (req, res) => {
  try {
    const properties = await readJSONFile('properties.json');
    const property = properties.find(p => p.id === req.params.id);
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// POST upload property images (protected, admin only)
router.post('/upload', authenticateToken, requireRole(['admin']), upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }
    
    // Return URLs for uploaded images
    const imageUrls = req.files.map(file => `/uploads/properties/${file.filename}`);
    
    await logActivity('UPLOAD_IMAGES', `Uploaded ${req.files.length} property images`, req.user.name);
    
    res.json({ imageUrls });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// POST new property (protected, admin only, with rate limiting)
router.post('/', authenticateToken, requireRole(['admin']), sanitizeBody, propertyCreationLimiter, async (req, res) => {
  try {
    const properties = await readJSONFile('properties.json');
    const newProperty = {
      id: generateId(),
      ...req.body,
      createdBy: req.user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      changeHistory: []
    };
    
    properties.push(newProperty);
    await writeJSONFile('properties.json', properties);
    
    await logActivity('CREATE_PROPERTY', `Created property: ${newProperty.title}`, req.user.name);
    
    res.status(201).json(newProperty);
  } catch (error) {
    console.error('Failed to create property:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// PUT update property (protected, admin only, with audit trail)
router.put('/:id', authenticateToken, requireRole(['admin']), sanitizeBody, async (req, res) => {
  try {
    const properties = await readJSONFile('properties.json');
    const index = properties.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    const oldProperty = { ...properties[index] };
    
    // Track important changes for audit trail
    if (req.body.price && req.body.price !== oldProperty.price) {
      recordChange(properties[index], 'price', oldProperty.price, req.body.price, req.user.id, req.user.name);
    }
    if (req.body.status && req.body.status !== oldProperty.status) {
      recordChange(properties[index], 'status', oldProperty.status, req.body.status, req.user.id, req.user.name);
    }
    
    properties[index] = {
      ...properties[index],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    
    await writeJSONFile('properties.json', properties);
    
    await logActivity('UPDATE_PROPERTY', `Updated property: ${properties[index].title}`, req.user.name);
    
    res.json(properties[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// DELETE property (protected, admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const properties = await readJSONFile('properties.json');
    const index = properties.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    const deletedProperty = properties.splice(index, 1)[0];
    await writeJSONFile('properties.json', properties);
    
    await logActivity('DELETE_PROPERTY', `Deleted property: ${deletedProperty.title}`, req.user.name);
    
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

module.exports = router;
