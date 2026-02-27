const fs = require('fs');
const path = require('path');

// Files that should not be backed up (frequently changing or large files)
const EXCLUDED_FROM_BACKUP = [
  'activity-log.json',
  'new-inquiries.json',
  'new-properties.json',
  'new-agents.json'
];

// Create backup of a file before modification
const backupFile = (filename) => {
  // Skip backup for excluded files
  if (EXCLUDED_FROM_BACKUP.includes(filename)) {
    return null;
  }
  
  const dataPath = path.join(__dirname, '../data', filename);
  const backupDir = path.join(__dirname, '../data/backups');
  
  try {
    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Check if source file exists
    if (!fs.existsSync(dataPath)) {
      return null;
    }
    
    // Create timestamped backup filename with .json extension at the end
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const baseNameWithoutExt = filename.replace(/\.json$/, '');
    const backupFilename = `${baseNameWithoutExt}.backup.${timestamp}.json`;
    const backupPath = path.join(backupDir, backupFilename);
    
    // Copy file to backup
    fs.copyFileSync(dataPath, backupPath);
    
    // Clean old backups (keep last 5 for better disk space management)
    cleanOldBackups(filename, 5);
    
    console.log(`Backup created: ${backupFilename}`);
    return backupFilename;
  } catch (error) {
    console.error(`Error creating backup for ${filename}:`, error);
    return null;
  }
};

// Clean old backup files, keeping only the specified number of most recent backups
const cleanOldBackups = (filename, keepCount) => {
  const backupDir = path.join(__dirname, '../data/backups');
  
  try {
    if (!fs.existsSync(backupDir)) {
      return;
    }
    
    // Get base filename without extension for matching
    const baseNameWithoutExt = filename.replace(/\.json$/, '');
    
    // Get all backup files for this filename (match both old and new naming conventions)
    const files = fs.readdirSync(backupDir)
      .filter(f => 
        f.startsWith(baseNameWithoutExt + '.backup.') || 
        f.startsWith(filename + '.backup.')
      )
      .map(f => ({
        name: f,
        path: path.join(backupDir, f),
        time: fs.statSync(path.join(backupDir, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Sort by modification time (newest first)
    
    // Delete old backups beyond keepCount
    files.slice(keepCount).forEach(file => {
      try {
        fs.unlinkSync(file.path);
        console.log(`Deleted old backup: ${file.name}`);
      } catch (error) {
        console.error(`Error deleting backup ${file.name}:`, error);
      }
    });
  } catch (error) {
    console.error(`Error cleaning old backups for ${filename}:`, error);
  }
};

// Restore from a specific backup
const restoreFromBackup = (filename, backupFilename) => {
  const dataPath = path.join(__dirname, '../data', filename);
  const backupPath = path.join(__dirname, '../data/backups', backupFilename);
  
  try {
    if (!fs.existsSync(backupPath)) {
      console.error(`Backup file not found: ${backupFilename}`);
      return false;
    }
    
    // Verify it's a JSON file
    if (!backupFilename.endsWith('.json')) {
      console.error(`Backup file must be a JSON file: ${backupFilename}`);
      return false;
    }
    
    // Copy backup to original location
    fs.copyFileSync(backupPath, dataPath);
    console.log(`Restored ${filename} from backup: ${backupFilename}`);
    return true;
  } catch (error) {
    console.error(`Error restoring from backup:`, error);
    return false;
  }
};

// List all backups for a file
const listBackups = (filename) => {
  const backupDir = path.join(__dirname, '../data/backups');
  
  try {
    if (!fs.existsSync(backupDir)) {
      return [];
    }
    
    // Get base filename without extension for matching
    const baseNameWithoutExt = filename.replace(/\.json$/, '');
    
    return fs.readdirSync(backupDir)
      .filter(f => 
        f.startsWith(baseNameWithoutExt + '.backup.') || 
        f.startsWith(filename + '.backup.')
      )
      .map(f => {
        const stats = fs.statSync(path.join(backupDir, f));
        return {
          filename: f,
          size: stats.size,
          created: stats.mtime
        };
      })
      .sort((a, b) => b.created.getTime() - a.created.getTime());
  } catch (error) {
    console.error(`Error listing backups for ${filename}:`, error);
    return [];
  }
};

// Delete all backups for a specific file
const deleteAllBackups = (filename) => {
  const backupDir = path.join(__dirname, '../data/backups');
  
  try {
    if (!fs.existsSync(backupDir)) {
      return 0;
    }
    
    // Get base filename without extension for matching
    const baseNameWithoutExt = filename.replace(/\.json$/, '');
    
    const files = fs.readdirSync(backupDir)
      .filter(f => 
        f.startsWith(baseNameWithoutExt + '.backup.') || 
        f.startsWith(filename + '.backup.')
      );
    
    let deletedCount = 0;
    files.forEach(file => {
      try {
        fs.unlinkSync(path.join(backupDir, file));
        deletedCount++;
        console.log(`Deleted backup: ${file}`);
      } catch (error) {
        console.error(`Error deleting backup ${file}:`, error);
      }
    });
    
    return deletedCount;
  } catch (error) {
    console.error(`Error deleting backups for ${filename}:`, error);
    return 0;
  }
};

module.exports = {
  backupFile,
  cleanOldBackups,
  restoreFromBackup,
  listBackups,
  deleteAllBackups
};
