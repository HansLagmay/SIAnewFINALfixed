const express = require('express');
const router = express.Router();
const { readJSONFile } = require('../utils/fileOperations');

// GET activity logs
router.get('/', (req, res) => {
  try {
    const logs = readJSONFile('activity-log.json');
    
    // Sort by timestamp descending (newest first)
    const sortedLogs = logs.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    // Optional pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedLogs = sortedLogs.slice(startIndex, endIndex);
    
    res.json({
      logs: paginatedLogs,
      total: logs.length,
      page,
      totalPages: Math.ceil(logs.length / limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

module.exports = router;
