const { writeJSONFile, readJSONFile } = require('../utils/fileOperations');

// Activity logger middleware
const logActivity = async (action, details, user = 'System') => {
  try {
    const logs = await readJSONFile('activity-log.json');
    
    const logEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action,
      details,
      user
    };
    
    logs.push(logEntry);
    await writeJSONFile('activity-log.json', logs);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = logActivity;
