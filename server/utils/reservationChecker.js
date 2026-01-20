/**
 * Reservation Checker - Auto-expiry system for reserved properties
 * Runs hourly to check for expired reservations and revert them to available
 */

const { readJSONFile, writeJSONFile } = require('./fileOperations');
const logActivity = require('../middleware/logger');

let intervalId = null;

/**
 * Check for expired reservations and update property status
 */
const checkExpiredReservations = async () => {
  try {
    console.log('[Reservation Checker] Starting reservation expiry check...');
    
    const properties = await readJSONFile('properties.json');
    const now = new Date();
    let expiredCount = 0;
    
    for (const property of properties) {
      // Check if property is reserved and has an expiry date
      if (property.status === 'reserved' && property.reservedUntil) {
        const expiryDate = new Date(property.reservedUntil);
        
        // If reservation has expired
        if (now > expiryDate) {
          console.log(`[Reservation Checker] Property ${property.id} (${property.title}) reservation expired`);
          
          // Update property status to available
          property.status = 'available';
          
          // Add to status history
          if (!property.statusHistory) {
            property.statusHistory = [];
          }
          property.statusHistory.push({
            status: 'available',
            changedBy: 'system',
            changedByName: 'Auto-Expiry System',
            changedAt: now.toISOString(),
            reason: `Reservation expired (was reserved until ${expiryDate.toISOString()})`
          });
          
          // Clear reservation fields
          const expiredReservationInfo = {
            reservedBy: property.reservedBy,
            reservedAt: property.reservedAt,
            reservedUntil: property.reservedUntil
          };
          
          delete property.reservedBy;
          delete property.reservedAt;
          delete property.reservedUntil;
          
          property.updatedAt = now.toISOString();
          
          expiredCount++;
          
          // Log activity
          await logActivity(
            'RESERVATION_EXPIRED', 
            `Property ${property.title} reservation expired (was reserved by ${expiredReservationInfo.reservedBy} until ${expiryDate.toLocaleString()})`,
            'System'
          );
        }
      }
    }
    
    // Save changes if any reservations expired
    if (expiredCount > 0) {
      await writeJSONFile('properties.json', properties);
      console.log(`[Reservation Checker] ✅ Expired ${expiredCount} reservation(s)`);
    } else {
      console.log('[Reservation Checker] ✅ No expired reservations found');
    }
    
    return { expiredCount };
  } catch (error) {
    console.error('[Reservation Checker] ❌ Error checking reservations:', error);
    throw error;
  }
};

/**
 * Start the reservation checker (runs hourly)
 * @param {number} intervalMs - Check interval in milliseconds (default: 1 hour)
 */
const startReservationChecker = (intervalMs = 60 * 60 * 1000) => {
  if (intervalId) {
    console.log('[Reservation Checker] Already running');
    return;
  }
  
  console.log(`[Reservation Checker] Starting... (checking every ${intervalMs / 1000 / 60} minutes)`);
  
  // Run immediately on start
  checkExpiredReservations().catch(err => {
    console.error('[Reservation Checker] Initial check failed:', err);
  });
  
  // Then run at intervals
  intervalId = setInterval(() => {
    checkExpiredReservations().catch(err => {
      console.error('[Reservation Checker] Scheduled check failed:', err);
    });
  }, intervalMs);
  
  console.log('[Reservation Checker] ✅ Started successfully');
};

/**
 * Stop the reservation checker
 */
const stopReservationChecker = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[Reservation Checker] ✅ Stopped');
  }
};

/**
 * Check if reservation checker is running
 * @returns {boolean}
 */
const isRunning = () => {
  return intervalId !== null;
};

module.exports = {
  checkExpiredReservations,
  startReservationChecker,
  stopReservationChecker,
  isRunning
};
