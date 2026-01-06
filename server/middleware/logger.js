const { writeJSONFile, readJSONFile } = require('../utils/fileOperations');

// Activity logger middleware
const logActivity = (action, details, user = 'System') => {
  const logs = readJSONFile('activity-log.json');
  
  const logEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    action,
    details,
    user
  };
  
  logs.push(logEntry);
  writeJSONFile('activity-log.json', logs);
};

module.exports = logActivity;
