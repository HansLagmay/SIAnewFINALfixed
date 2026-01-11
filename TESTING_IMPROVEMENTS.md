# 🧪 Testing Guide - 14 Critical Improvements

## ✅ All Features Implemented and Working

This document outlines how to test each of the 14 critical improvements that have been implemented.

---

## 🔴 CRITICAL SECURITY FIXES

### 1. Password Hashing with bcrypt ✅

**Test Steps:**
1. Start the server: `cd server && npm run dev`
2. Check console output - should see: "✅ All passwords already hashed. No migration needed."
3. Check `server/data/users.json` - passwords should start with `$2b$`
4. Try logging in at `http://localhost:5173/login`
   - Admin: admin@tesproperty.com / admin123
   - Agent: maria@tesproperty.com / agent123

**Expected Result:** Login works with plain text password, but stored as hash.

---

### 2. JWT Authentication System ✅

**Test Steps:**
1. Login successfully and open browser DevTools → Application → Local Storage
2. Check for `session` key containing JWT token
3. Try accessing protected endpoint without token:
   ```bash
   curl http://localhost:3000/api/users
   # Should return: {"error":"Access token required"}
   ```
4. Try with token:
   ```bash
   TOKEN="your-jwt-token-here"
   curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/users
   # Should return user data
   ```

**Expected Result:** 
- JWT token stored in session
- Protected routes require Bearer token
- 401 error without token

---

### 3. Input Sanitization ✅

**Test Steps:**
1. Submit inquiry with XSS attempt:
   - Name: `<script>alert('XSS')</script>`
   - Check `server/data/inquiries.json`
2. Should be escaped: `&lt;script&gt;alert(&#x27;XSS&#x27;)&lt;/script&gt;`

**Expected Result:** HTML special characters are escaped.

---

### 4. Rate Limiting ✅

**Test Steps:**
1. **Login Rate Limit** - Try logging in with wrong password 6 times quickly
   - Expected: 5th attempt blocked with error
2. **Inquiry Rate Limit** - Submit 4 inquiries quickly
   - Expected: 4th inquiry blocked
3. **API Rate Limit** - Make 101 API requests in 15 minutes
   - Expected: 101st request blocked with 429 status

**Expected Result:** Rate limit errors returned after threshold.

---

### 5. Session Expiration ✅

**Test Steps:**
1. Login and note session `expiresAt` time in localStorage
2. Manually change `expiresAt` to past time
3. Refresh page or make API call
4. Should redirect to login page with "Session expired" message

**Expected Result:** Auto-logout and redirect on expired session.

---

## 🟡 DATA INTEGRITY FIXES

### 6. File Locking (Race Condition Prevention) ✅

**Test Steps:**
1. Check `server/utils/fileOperations.js` - should use `proper-lockfile`
2. Run concurrent operations:
   ```bash
   # Terminal 1
   curl -X POST http://localhost:3000/api/inquiries -H "Content-Type: application/json" -d '{"name":"Test1","email":"test1@test.com","propertyId":"prop1"}'
   
   # Terminal 2 (at same time)
   curl -X POST http://localhost:3000/api/inquiries -H "Content-Type: application/json" -d '{"name":"Test2","email":"test2@test.com","propertyId":"prop2"}'
   ```

**Expected Result:** Both operations complete without data corruption.

---

### 7. Automatic Backup System ✅

**Test Steps:**
1. Check `server/data/backups/` directory exists
2. Make a change (e.g., create inquiry)
3. Check backups directory:
   ```bash
   ls -la server/data/backups/
   ```
4. Should see backup files: `inquiries.json.backup.2026-01-11T...`

**Expected Result:** 
- Backup created before every write
- Timestamped filenames
- Only last 10 backups kept

---

### 8. Duplicate Prevention (Enhanced) ✅

**Test Steps:**
1. Submit inquiry for a property
2. Try submitting another inquiry with same email + propertyId
3. Should get 409 error with existing ticket number

**Expected Result:** 
```json
{
  "error": "You have already submitted an inquiry for this property.",
  "existingTicket": "INQ-2026-001",
  "submittedAt": "2026-01-11T..."
}
```

---

### 9. Audit Trail System ✅

**Test Steps:**
1. Login as admin, change property price
2. Check `server/data/properties.json`
3. Find the property and check `changeHistory` array
4. Should see:
   ```json
   {
     "field": "price",
     "oldValue": "1000000",
     "newValue": "1200000",
     "changedBy": "admin-id",
     "changedByName": "Admin User",
     "changedAt": "2026-01-11T...",
     "reason": null
   }
   ```

**Expected Result:** Changes tracked with user, timestamp, and values.

---

## 🟢 PRODUCTION READINESS FEATURES

### 10. Image Upload System ✅

**Test Steps:**
1. Login as admin
2. Go to Properties → Add New Property
3. Upload images (max 10, 5MB each, JPG/PNG/WEBP)
4. Check `server/uploads/properties/` directory
5. Images should be accessible at `/uploads/properties/filename.jpg`

**Expected Result:** 
- Images uploaded successfully
- Unique filenames generated
- Accessible via static URL

---

### 11. Pagination System ✅

**Test Steps:**
1. Check API response:
   ```bash
   curl "http://localhost:3000/api/properties?page=1&limit=5"
   ```
2. Should return:
   ```json
   {
     "data": [...],
     "pagination": {
       "currentPage": 1,
       "totalPages": 10,
       "totalRecords": 50,
       "hasNext": true,
       "hasPrev": false,
       "limit": 5
     }
   }
   ```

**Expected Result:** Paginated response with metadata.

---

### 12. Comprehensive Error Handling ✅

**Test Steps:**
1. Login, then manually delete JWT token from localStorage
2. Try to access admin dashboard
3. Should see "Session expired" alert
4. Try making invalid API request
5. Should see user-friendly error message with retry button

**Expected Result:** 
- Error alerts displayed
- Retry button available
- Auto-redirect on 401

---

### 13. Environment Configuration ✅

**Test Steps:**
1. Check `.env.example` file exists with all variables
2. Create `.env` file with custom values:
   ```
   PORT=4000
   JWT_SECRET=my-custom-secret
   ```
3. Start server - should run on port 4000
4. Check `.gitignore` - should ignore `.env`

**Expected Result:** Environment variables working.

---

### 14. Mobile Responsiveness Enhancements ✅

**Test Steps:**
1. Open app in browser DevTools mobile view (320px width)
2. Check:
   - Buttons are at least 44px tall (touch-friendly)
   - Login form is usable
   - Session expired alert shows correctly

**Expected Result:** Basic mobile responsiveness working.

---

## 🚀 Integration Tests

### Full Login Flow
1. Go to login page
2. Login with admin credentials
3. Check localStorage has session with JWT
4. Navigate to admin dashboard
5. Create a property
6. Check backup created in `server/data/backups/`
7. Check activity log has entry
8. Logout
9. Session cleared from localStorage

### Full Inquiry Flow
1. Go to customer portal (no login)
2. Browse properties
3. Submit inquiry
4. Try submitting duplicate - should be rejected
5. Login as admin
6. Assign inquiry to agent
7. Check audit trail in inquiries.json
8. Login as agent
9. View assigned inquiry
10. Update status
11. Check audit trail updated

---

## 📊 Verification Checklist

- [x] Backend starts without errors
- [x] Password migration runs automatically
- [x] JWT tokens generated on login
- [x] Protected routes require authentication
- [x] Rate limiting blocks excessive requests
- [x] Input sanitization escapes HTML
- [x] File locking prevents race conditions
- [x] Backups created before writes
- [x] Duplicates rejected with 409
- [x] Audit trail tracks changes
- [x] Image upload works
- [x] Pagination returns metadata
- [x] Error handling displays messages
- [x] Environment variables work
- [x] Frontend builds successfully
- [x] Mobile view is functional

---

## 🎉 ALL TESTS PASSING

All 14 critical improvements are implemented, tested, and working correctly.
