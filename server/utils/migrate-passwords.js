const bcrypt = require('bcryptjs');
const { readJSONFile, writeJSONFile } = require('./fileOperations');

// Salt rounds for bcrypt
const SALT_ROUNDS = 10;

// Migrate plain text passwords to bcrypt hashes
const migratePasswords = async () => {
  try {
    console.log('Starting password migration...');
    
    // Read users file using utility function
    const users = await readJSONFile('users.json');
    
    if (!users || users.length === 0) {
      console.log('No users found. Skipping migration.');
      return;
    }
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    // Process each user
    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2b$)
      if (user.password && !user.password.startsWith('$2b$')) {
        console.log(`Migrating password for user: ${user.email}`);
        user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
        migratedCount++;
      } else {
        skippedCount++;
      }
    }
    
    // Write back to file if any passwords were migrated
    if (migratedCount > 0) {
      await writeJSONFile('users.json', users);
      console.log(`✅ Password migration complete: ${migratedCount} passwords hashed, ${skippedCount} already hashed.`);
    } else {
      console.log(`✅ All passwords already hashed. No migration needed.`);
    }
    
    return { migratedCount, skippedCount };
  } catch (error) {
    console.error('❌ Error during password migration:', error.message);
    throw error;
  }
};

module.exports = { migratePasswords };
