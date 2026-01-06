const fs = require('fs');
const path = require('path');

// Read JSON file
const readJSONFile = (filename) => {
  const filePath = path.join(__dirname, '../data', filename);
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
};

// Write JSON file
const writeJSONFile = (filename, data) => {
  const filePath = path.join(__dirname, '../data', filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
};

// Generate unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

module.exports = {
  readJSONFile,
  writeJSONFile,
  generateId
};
