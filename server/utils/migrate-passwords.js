const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Salt rounds for bcrypt
const SALT_ROUNDS = 10;

// Migrate plain text passwords to bcrypt hashes
const migratePasswords = async () => {
  const usersFilePath = path.join(__dirname, '../data/users.json');
  
  try {
    console.log('Starting password migration...');
    
    // Read users file
    if (!fs.existsSync(usersFilePath)) {
      console.log('No users file found. Skipping migration.');
      return;
    }
    
    const usersData = fs.readFileSync(usersFilePath, 'utf8');
    const users = JSON.parse(usersData);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    // Process each user
    for (let user of users) {
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
      fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
      console.log(`✅ Password migration complete: ${migratedCount} passwords hashed, ${skippedCount} already hashed.`);
    } else {
      console.log(`✅ All passwords already hashed. No migration needed.`);
    }
    
    return { migratedCount, skippedCount };
  } catch (error) {
    console.error('❌ Error during password migration:', error);
    throw error;
  }
};

module.exports = { migratePasswords };
