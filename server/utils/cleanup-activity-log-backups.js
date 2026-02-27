/**
 * Cleanup script to remove annoying backup files
 * - Removes all backups for frequently-changing files (activity-log, new-*, etc.)
 * - Removes old-format backups (without .json extension)
 * 
 * Usage: node cleanup-activity-log-backups.js
 */

const { deleteAllBackups } = require('./backup');
const path = require('path');
const fs = require('fs');

console.log('🧹 Cleaning up annoying backup files...\n');

// Files to remove all backups for (frequently changing, not needed)
const filesToClean = [
  'activity-log.json',
  'new-inquiries.json',
  'new-properties.json',
  'new-agents.json'
];

let totalDeleted = 0;

// Clean backups for frequently-changing files
filesToClean.forEach(filename => {
  console.log(`Cleaning backups for: ${filename}`);
  const count = deleteAllBackups(filename);
  totalDeleted += count;
  if (count > 0) {
    console.log(`  ✓ Deleted ${count} backup(s)`);
  } else {
    console.log(`  ✓ No backups found`);
  }
});

// Clean old-format backups (files without .json extension)
console.log('\nCleaning old-format backups (without .json extension)...');
const backupDir = path.join(__dirname, '../data/backups');

if (fs.existsSync(backupDir)) {
  const files = fs.readdirSync(backupDir);
  const oldFormatFiles = files.filter(f => !f.endsWith('.json'));
  
  oldFormatFiles.forEach(file => {
    try {
      fs.unlinkSync(path.join(backupDir, file));
      totalDeleted++;
      console.log(`  ✓ Deleted: ${file}`);
    } catch (error) {
      console.error(`  ✗ Error deleting ${file}:`, error.message);
    }
  });
  
  if (oldFormatFiles.length === 0) {
    console.log('  ✓ No old-format backups found');
  }
}

console.log(`\n✅ Cleanup complete! Deleted ${totalDeleted} file(s) total`);
console.log('\n📝 Going forward:');
console.log('   • Activity logs and new-* files won\'t be backed up');
console.log('   • New backups will have .json extension for better editing');
console.log('   • Only 5 most recent backups kept per file (was 10)');

