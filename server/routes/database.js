const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { readJSONFile, writeJSONFile } = require('../utils/fileOperations');
const { authenticateToken, requireRole } = require('../middleware/auth');
const logActivity = require('../middleware/logger');

// Get database overview statistics (protected, admin only)
router.get('/overview', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const properties = await readJSONFile('properties.json');
    const inquiries = await readJSONFile('inquiries.json');
    const users = await readJSONFile('users.json');
    const calendarEvents = await readJSONFile('calendar-events.json');
    const activityLog = await readJSONFile('activity-log.json');
    const newProperties = await readJSONFile('new-properties.json');
    const newInquiries = await readJSONFile('new-inquiries.json');
    const newAgents = await readJSONFile('new-agents.json');
    
    res.json({
      properties: {
        total: properties.length,
        new: newProperties.length
      },
      inquiries: {
        total: inquiries.length,
        new: newInquiries.length,
        byStatus: getInquiryStatusBreakdown(inquiries)
      },
      users: {
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        agents: users.filter(u => u.role === 'agent').length,
        new: newAgents.length
      },
      calendar: {
        total: calendarEvents.length
      },
      activityLog: {
        total: activityLog.length,
        last24Hours: activityLog.filter(a => isWithin24Hours(a.timestamp)).length
      },
      lastActivity: activityLog.length > 0 ? activityLog[activityLog.length - 1] : null
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get file metadata
router.get('/file-metadata/:filename', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../data', filename);
    const stats = await fs.stat(filePath);
    const data = readJSONFile(filename);
    
    res.json({
      filename,
      size: stats.size,
      sizeFormatted: formatBytes(stats.size),
      lastModified: stats.mtime,
      recordCount: Array.isArray(data) ? data.length : 0
    });
  } catch (error) {
    console.error('Error fetching file metadata:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all data from specific file
router.get('/file/:filename', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const data = readJSONFile(req.params.filename);
    res.json(data);
  } catch (error) {
    console.error('Error fetching file data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get recently added items (new-* files)
router.get('/recent/:type', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { type } = req.params; // 'properties', 'inquiries', 'agents'
    const filename = `new-${type}.json`;
    const data = readJSONFile(filename);
    res.json(data);
  } catch (error) {
    console.error('Error fetching recent items:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear "new-*" tracking files
router.post('/clear-new/:type', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { type } = req.params; // 'properties', 'inquiries', 'agents'
    const filename = `new-${type}.json`;
    const data = readJSONFile(filename);
    const count = Array.isArray(data) ? data.length : 0;
    
    // Clear the data array
    writeJSONFile(filename, []);
    
    // Log activity
    await logActivity(
      'CLEAR_NEW_DATA',
      `Cleared new-${type} tracking list (${count} items)`,
      req.body.clearedBy || 'System Admin'
    );
    
    res.json({ success: true, message: `Cleared new-${type} list`, count });
  } catch (error) {
    console.error('Error clearing new items:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export file as CSV
router.get('/export/:filename/csv', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const data = readJSONFile(req.params.filename);
    const csv = convertToCSV(data);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename.replace('.json', '.csv')}"`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export file as JSON
router.get('/export/:filename/json', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const data = readJSONFile(req.params.filename);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`);
    res.json(data);
  } catch (error) {
    console.error('Error exporting JSON:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function getInquiryStatusBreakdown(inquiries) {
  return inquiries.reduce((acc, inq) => {
    acc[inq.status] = (acc[inq.status] || 0) + 1;
    return acc;
  }, {});
}

function isWithin24Hours(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  return diff < 24 * 60 * 60 * 1000;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function convertToCSV(data) {
  if (!data || !Array.isArray(data) || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  // Sanitize value to prevent CSV injection
  const sanitizeValue = (val) => {
    if (val === null || val === undefined) return '';
    
    let strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
    
    // Prevent CSV injection - escape values starting with =, +, -, @
    const firstChar = strVal.charAt(0);
    if (firstChar === '=' || firstChar === '+' || firstChar === '-' || firstChar === '@') {
      strVal = "'" + strVal;
    }
    
    // Escape quotes and wrap in quotes if contains special characters
    if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
      return `"${strVal.replace(/"/g, '""')}"`;
    }
    
    return strVal;
  };
  
  for (const row of data) {
    const values = headers.map(header => sanitizeValue(row[header]));
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

module.exports = router;
