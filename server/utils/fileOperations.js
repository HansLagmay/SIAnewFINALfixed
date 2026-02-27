const lockfile = require('proper-lockfile');
const path = require('path');
const fs = require('fs');
const { backupFile } = require('./backup');

// Wrapper function to execute operations with file locking
const withFileLock = async (filename, operation) => {
  const filePath = path.join(__dirname, '../data', filename);
  let release;
  
  try {
    // Ensure file exists before locking
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '[]', 'utf8');
    }
    
    // Acquire exclusive lock with retry mechanism
    release = await lockfile.lock(filePath, {
      retries: {
        retries: 10,
        minTimeout: 100,
        maxTimeout: 1000
      }
    });
    
    // Perform the operation
    const result = await operation();
    
    return result;
  } catch (error) {
    console.error(`Error in withFileLock for ${filename}:`, error);
    throw error;
  } finally {
    // Always release the lock
    if (release) {
      try {
        await release();
      } catch (releaseError) {
        console.error(`Error releasing lock for ${filename}:`, releaseError);
      }
    }
  }
};

// Read JSON file with locking
const readJSONFile = async (filename) => {
  return await withFileLock(filename, () => {
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
  });
};

// Write JSON file with locking and backup
const writeJSONFile = async (filename, data) => {
  return await withFileLock(filename, () => {
    const filePath = path.join(__dirname, '../data', filename);
    
    try {
      // Create backup before writing (backupFile handles exclusions internally)
      if (fs.existsSync(filePath)) {
        backupFile(filename);
      }
      
      // Write the file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error(`Error writing ${filename}:`, error);
      return false;
    }
  });
};

// Generate unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

module.exports = {
  readJSONFile,
  writeJSONFile,
  generateId,
  withFileLock
};
