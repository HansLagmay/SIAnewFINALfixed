# 🏠 TES Property System v2.3 - Real Estate Inquiry Management

A complete professional real estate management system with **React + Express** architecture, using **JSON file-based database** for simplicity and portability.

## 🎯 Project Overview

**No external database required!** This system uses JSON files for data storage, making it perfect for:
- Development and testing
- Portfolio demonstrations  
- Quick deployments
- Learning full-stack development

All you need is **VS Code** and **Node.js**.

### Key Features
- 🏢 **Property Management** - Create, list, and manage property listings with workflow validation
- 📋 **Inquiry System** - Customer inquiries with agent assignment and status tracking
- 📅 **Calendar & Scheduling** - Schedule property viewings with automatic property status updates
- 👥 **Multi-Role System** - Admin, Agent, and Customer portals with role-based access
- 📊 **Agent Performance** - Track agent metrics, conversion rates, and sales performance
- 🔒 **Enterprise Security** - JWT auth, bcrypt hashing, input sanitization, rate limiting
- 📁 **JSON Database** - No external database needed, automatic backups included

---

## 🔒 Security Features (Version 2.3)

### ✅ Implemented Security
- **Password Hashing** - bcrypt with 10 salt rounds
- **JWT Authentication** - 8-hour session tokens
- **Input Sanitization** - XSS protection on all user inputs
- **Rate Limiting** - API protection (1000 requests/min), login brute force protection (5 attempts/15min)
- **Session Management** - Auto-logout on token expiration
- **File Locking** - Race condition prevention with proper-lockfile
- **Automatic Backups** - Timestamped backups before every write (keep last 10)
- **Duplicate Prevention** - 409 status for duplicate inquiries
- **Audit Trail** - Track all changes with user, timestamp, old/new values
- **Image Upload** - Multer with 5MB limit, 10 images max
- **Pagination** - Server-side pagination on all endpoints
- **Error Handling** - User-friendly messages with retry options

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2+ | UI library |
| **TypeScript** | 5.3+ | Type-safe JavaScript |
| **React Router** | 6.22+ | Client-side routing |
| **Vite** | 5.1+ | Fast build tool |
| **Tailwind CSS** | 3.4+ | Utility-first CSS |
| **Axios** | 1.6+ | HTTP client |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express.js** | 4.18+ | REST API framework |
| **bcrypt** | Latest | Password hashing |
| **jsonwebtoken** | Latest | JWT authentication |
| **express-rate-limit** | Latest | Rate limiting |
| **validator** | Latest | Input sanitization |
| **multer** | Latest | File upload handling |
| **proper-lockfile** | Latest | File locking |

### Database
| Technology | Purpose |
|------------|---------|
| **JSON Files** | Data storage (no external DB needed!) |
| **fs-extra** | Enhanced file operations |

---

## 📦 Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **VS Code** (recommended)
- **Git**

**No MongoDB, MySQL, or external database required!**

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/HansLagmay/SIAnewFINALfixed.git
cd SIAnewFINALfixed
```

### 2. Install All Dependencies
```bash
npm install
```

This installs dependencies for root, client, and server.

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Backend Server Configuration
PORT=3000
NODE_ENV=development

# Frontend Configuration
VITE_API_URL=http://localhost:3000/api

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# JWT Secret (Change this to a random string!)
JWT_SECRET=your-super-secure-secret-key-minimum-32-characters-long
```

### 4. Start the Application

```bash
npm run dev
```

This starts both:
- **Backend**: `http://localhost:3000`
- **Frontend**: `http://localhost:5173`

### 5. Access the Portals

| Portal | URL | Login Required? | Test Account |
|--------|-----|-----------------|--------------|
| **Customer Portal** | `http://localhost:5173/` | ❌ No | N/A - Public |
| **Login Page** | `http://localhost:5173/login` | - | See below |
| **Admin Portal** | `http://localhost:5173/admin` | ✅ Yes | admin@tesproperty.com / admin123 |
| **Agent Portal** | `http://localhost:5173/agent` | ✅ Yes | maria@tesproperty.com / agent123 |
| **Super Admin Portal** | `http://localhost:5173/superadmin` | ✅ Yes | Use admin credentials |
| **Database Portal** | `http://localhost:5173/database` | ✅ Yes | Use admin credentials |

**Admin Portal Features:**
- Dashboard with real-time statistics
- Property management with workflow validation
- Inquiry management and agent assignment
- Agent management (create, edit, delete agents)
- Agent Performance tracking and metrics

**Agent Portal Features:**
- Dashboard with assigned inquiries
- Calendar for scheduling property viewings
- Property listings with reservation capabilities
- Inquiry management (view and update status)

---

## 🗄️ JSON File Database Structure

Your data is stored in `server/data/*.json` files:

```
server/data/
├── properties.json          # All property listings
├── inquiries.json           # Customer inquiries
├── users.json               # Admin and agent accounts
├── calendar-events.json     # Viewing schedules
├── activity-log.json        # System activity tracking
├── new-properties.json      # Recently added properties
├── new-inquiries.json       # Recent inquiries
└── new-agents.json          # Recently added agents
```

### Data Backup System
- Automatic backups created before every write operation
- Stored in `server/data/backups/`
- Format: `[filename]-backup-[timestamp].json`
- Keeps last 10 backups per file
- Manual restore: Copy backup file to main `data/` folder

---

## 🔑 Test Credentials

### Admin Account
- **Email**: `admin@tesproperty.com`
- **Password**: `admin123`
- **Access**: All features (properties, inquiries, agents, database, agent performance reports)

### Agent Account
- **Email**: `maria@tesproperty.com`
- **Password**: `agent123`
- **Access**: Own inquiries, calendar, available properties, property reservations

⚠️ **Password Security**: 
- All passwords are **hashed** using bcrypt (not stored as plain text)
- Change default passwords before production deployment
- Minimum 8 characters required for new passwords

---

## 📋 Available Scripts

### Root Level Commands

```bash
# Start both frontend and backend concurrently
npm run dev

# Install all dependencies (root + client + server)
npm install

# Build frontend for production
npm run build

# Preview production build
npm run preview
```

### Backend Commands (from root or server directory)

```bash
# Start backend only
cd server && npm run dev

# Start backend (production mode)
cd server && npm start

# Run password migration utility
cd server && node utils/migrate.js
```

### Frontend Commands (from root or client directory)

```bash
# Start frontend only
cd client && npm run dev

# Build frontend
cd client && npm run build

# Preview production build
cd client && npm run preview
```

---

## 🔌 API Endpoints

### Authentication (Public)

| Method | Endpoint | Description | Rate Limited |
|--------|----------|-------------|--------------|
| POST | `/api/login` | User login | ✅ 5/15min |

### Properties

| Method | Endpoint | Description | Auth Required | Rate Limited |
|--------|----------|-------------|---------------|--------------|
| GET | `/api/properties` | Get all properties (paginated) | ❌ Public | ❌ |
| GET | `/api/properties/:id` | Get single property | ❌ Public | ❌ |
| POST | `/api/properties` | Create property | ✅ Admin | ✅ 10/hour |
| PUT | `/api/properties/:id` | Update property (with workflow validation) | ✅ Admin/Agent | ❌ |
| DELETE | `/api/properties/:id` | Delete property | ✅ Admin | ❌ |
| POST | `/api/properties/upload` | Upload images (max 10, 5MB each) | ✅ Admin | ❌ |

### Inquiries

| Method | Endpoint | Description | Auth Required | Rate Limited |
|--------|----------|-------------|---------------|--------------|
| POST | `/api/inquiries` | Submit inquiry (with XSS protection) | ❌ Public | ✅ 3/hour |
| GET | `/api/inquiries` | Get all inquiries (paginated) | ✅ Admin/Agent | ❌ |
| GET | `/api/inquiries/:id` | Get single inquiry | ✅ Admin/Agent | ❌ |
| PUT | `/api/inquiries/:id` | Update inquiry | ✅ Admin/Agent | ❌ |
| POST | `/api/inquiries/:id/claim` | Agent claims inquiry | ✅ Agent | ❌ |
| POST | `/api/inquiries/:id/assign` | Admin assigns inquiry | ✅ Admin | ❌ |

### Users

| Method | Endpoint | Description | Auth Required | Rate Limited |
|--------|----------|-------------|---------------|--------------|
| GET | `/api/users` | Get all users | ✅ Admin | ✅ 1000/min |
| GET | `/api/users/agents` | Get all agents | ✅ Admin | ❌ |
| POST | `/api/users` | Create agent | ✅ Admin | ❌ |
| DELETE | `/api/users/:id` | Delete user | ✅ Admin | ❌ |

### Calendar

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/calendar` | Get all events | ✅ Admin/Agent |
| GET | `/api/calendar/agent/:id` | Get agent events | ✅ Agent |
| POST | `/api/calendar` | Create event (auto-updates property status) | ✅ Admin/Agent |
| PUT | `/api/calendar/:id` | Update event | ✅ Admin/Agent |
| DELETE | `/api/calendar/:id` | Delete event | ✅ Admin/Agent |

**Note:** When scheduling a viewing via calendar, the associated property automatically updates to "under-contract" status.

### Database Portal

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/database/overview` | Get database stats | ✅ Admin |
| GET | `/api/database/file-metadata/:filename` | Get file metadata | ✅ Admin |
| GET | `/api/database/file/:filename` | Get file contents | ✅ Admin |
| GET | `/api/database/recent/:type` | Get recent items | ✅ Admin |
| POST | `/api/database/clear-new/:type` | Clear tracking list | ✅ Admin |
| GET | `/api/database/export/:filename/csv` | Export as CSV | ✅ Admin |
| GET | `/api/database/export/:filename/json` | Export as JSON | ✅ Admin |

---

## 🔄 Property Workflow System

The system enforces strict workflow rules for property status transitions and includes automatic status updates.

### Automatic Status Updates

**Viewing Scheduled:**
- When an agent schedules a property viewing through the calendar
- Property status automatically changes from `available` or `reserved` to `under-contract`
- Status history is logged with customer name and ticket number
- Ensures properties are marked as in-progress once viewings are scheduled

### Status Transition Rules

```
draft → available, withdrawn
available → reserved, under-contract, withdrawn, off-market
reserved → under-contract, available, withdrawn
under-contract → sold, available, withdrawn
sold → [terminal state - no transitions]
withdrawn → available
off-market → available
```

### Status Requirements

Each status requires specific fields to be present:

| Status | Required Fields |
|--------|----------------|
| `available` | title, price, location, description |
| `reserved` | reservedBy, reservedAt, reservedUntil |
| `under-contract` | Auto-set when viewing scheduled |
| `sold` | soldBy, soldByAgentId, soldAt, salePrice |
| `draft`, `withdrawn`, `off-market` | No additional requirements |

### Workflow Diagram

```
┌─────────┐
│  Draft  │
└────┬────┘
     ↓
┌─────────────┐      ┌──────────┐
│  Available  │ ←──→ │ Reserved │
└──────┬──────┘      └────┬─────┘
       │                  │
       ↓                  ↓
┌──────────────────┐      │
│ Under Contract   │ ←────┘  [Auto-set on viewing scheduled]
└────────┬─────────┘
         ↓
    ┌────────┐
    │  Sold  │ [Terminal]
    └────────┘
    
    ↓ (Any status can be)
┌──────────┐
│Withdrawn │
└──────────┘
```

### Validation

- **Server-Side**: All status changes are validated in `server/utils/propertyWorkflow.js`
- **Automatic Updates**: ViewScheduling triggers automatic status change to under-contract
- **Automatic Rejection**: Invalid transitions return 400 error with clear message
- **Missing Fields**: System checks for required fields before allowing status change

---

## ⏰ Reservation Auto-Expiry System

Properties can be reserved for agents with automatic expiry functionality.

### Features
- **Time-Limited Reservations**: Set reservation duration in hours (default: 24 hours)
- **Automatic Expiry**: Background checker runs hourly to expire old reservations
- **Status History**: All reservation changes are logged with reasons
- **Admin Controls**: Admins can manually reserve properties for agents

### How It Works

1. **Creating Reservation**:
   ```javascript
   // Admin reserves property for agent
   status: 'reserved'
   reservedBy: 'Agent Name'
   reservedAt: '2026-01-20T10:00:00Z'
   reservedUntil: '2026-01-21T10:00:00Z'  // 24 hours later
   ```

2. **Automatic Expiry**:
   - Background checker runs every hour
   - Checks all reserved properties for expired reservations
   - If `current time > reservedUntil`:
     - Status changes to 'available'
     - Reservation fields are cleared
     - Status history is updated
     - Activity log records the expiry

3. **Manual Management**:
   - Admins can change status from reserved to available manually
   - Admins can extend reservations by updating `reservedUntil` field

### Configuration

The reservation checker starts automatically on server boot:
```javascript
// In server/server.js
startReservationChecker(); // Runs every 60 minutes (3600000ms)
```

To change the interval, pass milliseconds:
```javascript
startReservationChecker(30 * 60 * 1000); // Check every 30 minutes
```

---

## 🧪 Testing the System

### 1. Test Customer Portal (Public Access)
```bash
# Open browser
http://localhost:5173/

# Expected: See property listings without login
# Actions: Browse properties, submit inquiry
```

### 2. Test Admin Login
```bash
# Navigate to login
http://localhost:5173/login

# Credentials:
Email: admin@tesproperty.com
Password: admin123

# Expected: Redirect to /admin/dashboard
# Verify: Dashboard shows statistics
```

### 3. Test Security Features

**Password Hashing:**
```bash
# Check users.json file
cat server/data/users.json

# Verify passwords start with $2b$ (bcrypt hash)
```

**Rate Limiting:**
```bash
# Try 6 failed login attempts
# Expected: "Too many login attempts" after 5th attempt
```

**JWT Authentication:**
```bash
# Try accessing protected route without token
curl http://localhost:3000/api/users

# Expected: 401 Unauthorized
```

### 4. Test Database Portal
```bash
# Login as admin
# Navigate to: http://localhost:5173/database

# Expected: See database overview dashboard
# Actions: View files, export data, clear tracking lists
```

---

## 📁 Project Structure

```
SIAnewFINALfixed/
├── client/                       # Frontend React application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── admin/          # Admin portal components
│   │   │   │   ├── AdminAgents.tsx
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── AdminInquiries.tsx
│   │   │   │   ├── AdminProperties.tsx (property management with workflow)
│   │   │   │   ├── AdminReports.tsx (agent performance metrics)
│   │   │   │   ├── AdminSidebar.tsx
│   │   │   │   └── AssignAgentModal.tsx
│   │   │   ├── agent/          # Agent portal components
│   │   │   │   ├── AgentCalendar.tsx
│   │   │   │   ├── AgentDashboard.tsx
│   │   │   │   ├── AgentInquiries.tsx
│   │   │   │   ├── AgentProperties.tsx
│   │   │   │   ├── AgentSidebar.tsx
│   │   │   │   └── ScheduleViewingModal.tsx (auto-updates property status)
│   │   │   ├── customer/       # Customer portal components
│   │   │   ├── database/       # Database portal components
│   │   │   └── shared/         # Shared components
│   │   │       ├── AgentSelectModal.tsx (agent search & selection)
│   │   │       ├── ConfirmDialog.tsx
│   │   │       ├── PromptDialog.tsx
│   │   │       ├── SelectDialog.tsx (dropdown selection)
│   │   │       └── Toast.tsx
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services (Axios)
│   │   ├── types/              # TypeScript type definitions
│   │   │   ├── api.ts
│   │   │   ├── forms.ts
│   │   │   └── index.ts (Property, Inquiry, User types)
│   │   ├── utils/              # Utility functions
│   │   ├── App.tsx             # Main app component
│   │   └── main.tsx            # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── server/                       # Backend Express application
│   ├── data/                    # JSON file database
│   │   ├── backups/            # Automatic backups
│   │   ├── properties.json
│   │   ├── inquiries.json
│   │   ├── users.json
│   │   ├── calendar-events.json
│   │   ├── activity-log.json
│   │   ├── new-properties.json
│   │   ├── new-inquiries.json
│   │   └── new-agents.json
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication
│   │   ├── logger.js           # Activity logging
│   │   ├── rateLimiter.js      # Rate limiting
│   │   └── sanitize.js         # Input sanitization
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── properties.js       # Property endpoints
│   │   ├── inquiries.js        # Inquiry endpoints
│   │   ├── users.js            # User management
│   │   ├── calendar.js         # Calendar events
│   │   ├── activity-log.js     # Activity logs
│   │   └── database.js         # Database portal API
│   ├── uploads/                 # Uploaded property images
│   │   └── properties/
│   ├── utils/
│   │   ├── auditTrail.js        # Audit logging
│   │   ├── backup.js            # Automatic backups
│   │   ├── fileOperations.js   # JSON file read/write with locking
│   │   ├── migrate.js           # Password migration
│   │   ├── paginate.js          # Pagination utility
│   │   ├── passwordHash.js      # Password hashing
│   │   ├── propertyWorkflow.js  # Property status workflow validation
│   │   ├── reservationChecker.js # Auto-expiry for reservations
│   │   └── sanitize.js          # Input sanitization & XSS detection
│   ├── server.js                # Express server entry point
│   └── package.json
│
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json                 # Root package.json
├── README.md                    # This file
├── TESTING_IMPROVEMENTS.md      # Testing documentation
├── SECURITY_SUMMARY.md          # Security features documentation
└── IMPLEMENTATION_COMPLETE.md   # Implementation details
```

---

## 🗓️ Update Log

### 2026-03-01 (v2.3)
- **Removed Commission Tracking**: Commission management removed from system - now handled externally/offline by admin
- **Agent Performance Only**: Simplified Reports to show only Agent Performance metrics (removed Activity Logs to save space)
- **Automatic Property Status**: Properties automatically update to "under-contract" when viewing is scheduled
- **Rate Limiter Optimization**: Increased API rate limit from 100/15min to 1000/min for better development experience
- **Navigation Update**: Admin sidebar now shows "Agent Performance" instead of "Reports"
- **Property Sales Tracking**: Admins can still mark properties as sold and track which agent sold them for manual commission calculations

### 2026-01-29
- Agent Portal: fixed infinite loading by using session-based user detection across dashboard and calendar; user-friendly error banners added
- HR Portal: enforced manual password creation with strength validation; removed auto-generate path; added debounced inline email duplicate validation
- Agent Properties: added clear labels and hints for draft property form; session-aware filter for “My Drafts”
- Docs: updated clone instructions to SIAnewFINALfixed and project structure name; build verified

### 2026-01-27
- Inline HR registration validations added across 7 sections (real-time checks for birthdate ≥18, email format, PH phone, salary, manual password strength and match)
- Added option to generate secure password or set manual password; post-registration success screen shows email + plain password once for secure sharing
- Customer Portal improved with Services, Testimonials, FAQ, About, and Contact sections; navbar anchors link to each section
- Database Portal enhanced with robust loading and friendly empty states for files and tables; export and “clear new” flows verified
- Agent draft property creation workflow implemented (agent-only); Admin live property creation retained with upload support
- Property type extended with createdBy; statusHistory/viewCount/viewHistory maintained on create/update
- Confirmed bcrypt hashing on server; login compares hash; migration utility runs on server start
- Verified protected routes and role access for Admin/Agent/Super Admin/Database portals
- Build and typecheck succeeded; dev server auto-fallback when default ports are used
- Port guidance: Backend defaults to 3000; Frontend defaults to 5173 (auto-fallback to next available). If 3000 is busy, set `PORT=3001` and `VITE_API_URL=http://localhost:3001/api` in `.env`


---

## 🔒 Security Best Practices

### For Development
1. ✅ Never commit `.env` file to Git
2. ✅ Use strong JWT_SECRET (minimum 32 characters)
3. ✅ Keep `node_modules/` in `.gitignore`
4. ✅ Regularly backup `server/data/` folder
5. ✅ Test rate limiting with multiple failed attempts

### For Production Deployment
1. 🔐 Change all default passwords
2. 🔐 Generate new JWT_SECRET
3. 🔐 Set NODE_ENV=production
4. 🔐 Enable HTTPS/SSL
5. 🔐 Configure proper CORS origins
6. 🔐 Set up automated backups
7. 🔐 Implement external database (MongoDB/PostgreSQL) for scalability
8. 🔐 Use environment-specific secrets management

---

## 🚨 Common Issues & Solutions

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Issue: "Cannot find module 'xyz'"
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Or install specific package
npm install xyz
```

### Issue: "JWT token expired"
**Solution:**
- Login again to get new token
- Token expires after 8 hours (configurable in `server/middleware/auth.js`)

### Issue: "Rate limit exceeded"
**Solution:**
- API Rate Limit: 1000 requests per minute (general endpoints)
- Login Rate Limit: 5 attempts per 15 minutes
- Wait for the time window to reset
- In development, you can adjust limits in `server/middleware/rateLimiter.js`

### Issue: "Data not persisting"
**Solution:**
- Check file permissions on `server/data/` folder
- Verify `server/utils/fileOperations.js` is working
- Check `server/data/backups/` for recent backups

---

## 📚 Additional Documentation

- **[TESTING_IMPROVEMENTS.md](./TESTING_IMPROVEMENTS.md)** - Comprehensive testing guide
- **[SECURITY_SUMMARY.md](./SECURITY_SUMMARY.md)** - Security implementation details
- **[IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)** - Feature implementation checklist

---

## 🧪 Testing Guide for New Features

### Testing Automatic Property Status Update

1. **As Agent - Schedule a Viewing**:
   ```bash
   # Login as agent (maria@tesproperty.com / agent123)
   # Navigate to Calendar or Inquiries
   # Select an inquiry with an assigned property
   # Click "Schedule Viewing"
   # Fill in viewing date/time and customer details
   # Save the viewing
   # Expected: Property status automatically changes to "under-contract"
   # Verify status history shows: "Viewing scheduled with [customer] ([ticket])"
   ```

2. **Verify Property Status Change**:
   ```bash
   # As admin, navigate to Properties page
   # Find the property that had viewing scheduled
   # Status should show "Under Contract"
   # Click "View History" to see status change log
   ```

### Testing Agent Performance Metrics

1. **As Admin - View Agent Performance**:
   ```bash
   # Login as admin
   # Navigate to "Agent Performance" from sidebar
   # Expected: See list of all agents with metrics
   # Metrics include:
   #   - Active Inquiries count
   #   - Properties Sold count
   #   - Total Sales Value
   #   - Conversion Rate (%)
   # Click "Refresh" to reload latest data
   ```

2. **Verify Metrics Calculation**:
   ```bash
   # Manual verification:
   # - Active Inquiries = inquiries with agent assigned and not closed
   # - Properties Sold = properties with agent as soldByAgentId
   # - Total Sales = sum of salePrice for sold properties
   # - Conversion Rate = (Properties Sold / Total Assigned Inquiries) × 100
   ```

### Testing Property Workflow

1. **Valid Transition**:
   ```bash
   # Try: available → reserved → under-contract → sold
   # Expected: All transitions succeed
   ```

2. **Invalid Transition**:
   ```bash
   # Try: available → sold (skipping required steps)
   # Expected: Error message about invalid transition
   ```

3. **Missing Required Fields**:
   ```bash
   # Try: Change to "sold" without setting agent and sale price
   # Expected: Error about missing required fields
   ```

### Testing Reservation System

1. **Create Reservation**:
   ```bash
   # As Admin, select available property
   # Click "Reserve" button
   # Select agent and set duration (e.g., 24 hours)
   # Verify status changes to "reserved"
   # Check reservation details are displayed
   ```

2. **Auto-Expiry**:
   ```bash
   # Create reservation with 1-hour duration
   # Wait 1+ hours
   # Check server logs for expiry message
   # Verify property status reverted to "available"
   # Check activity log for expiry event
   ```

3. **Manual Expiry**:
   ```bash
   # Change reserved property back to available
   # Verify reservation fields are cleared
   ```

### Testing Security Fixes

1. **XSS Protection**:
   ```bash
   # Try submitting inquiry with: <script>alert(1)</script>
   # Expected: Error "Invalid content detected"
   # Verify inquiry is not saved
   ```

2. **Duplicate Check (7-day)**:
   ```bash
   # Submit inquiry for property
   # Try submitting again within 7 days
   # Expected: 409 error with ticket number
   # Wait 8 days and try again
   # Expected: New inquiry created successfully
   ```

### Integration Testing

Run the full system test:
```bash
# 1. Start server
npm run dev

# 2. Check startup logs for:
#    - Password migration
#    - Reservation checker started
#    - Rate limiter configured

# 3. Test complete workflow:
#    - Customer submits inquiry
#    - Admin assigns inquiry to agent
#    - Agent schedules viewing (property auto-updates to "under-contract")
#    - Admin marks property as sold
#    - Admin views agent performance metrics
```

---

## 🎯 Features Roadmap

### ✅ Completed (v2.3)
- JWT authentication with 8-hour session tokens
- Password hashing (bcrypt with 10 salt rounds)
- Input sanitization with XSS rejection
- Rate limiting (API: 1000 req/min, Login: 5 attempts/15min)
- File-based JSON database with automatic backups
- Multi-role system (Admin/Agent/Customer portals)
- Image upload (max 10 images, 5MB each)
- Activity logging and audit trails
- Database portal with export functionality
- Property workflow validation
- Auto-expiring property reservations
- **Automatic property status updates** (under-contract when viewing scheduled)
- **Agent performance tracking** (conversion rates, sales metrics)
- **Enhanced security** (XSS protection, duplicate prevention)

### 🔄 In Progress
- Email notifications for inquiry assignments
- Advanced search filters for properties
- Property comparison feature

### 📋 Planned (v2.4)
- Two-factor authentication (2FA)
- Real-time notifications (WebSockets)
- Advanced analytics dashboard
- Mobile responsive improvements
- Dark mode theme
- Document attachment support

### 🚀 Future (v3.0)
- Migration to PostgreSQL/MongoDB for scalability
- GraphQL API implementation
- Mobile app (React Native)
- Multi-language support (i18n)
- AI-powered property recommendations
- Integrated payment gateway for reservations

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 📞 Support

- **GitHub Issues**: [Report a bug](https://github.com/HansLagmay/SIAfrontendonlyFINAL/issues)
- **Discussions**: [Ask questions](https://github.com/HansLagmay/SIAfrontendonlyFINAL/discussions)

---

**Version:** 2.3.0  
**Last Updated:** March 1, 2026  
**Maintained by:** HansLagmay

---

⭐ **Star this repo if you find it helpful!**

🎓 **Perfect for:**
- Full-stack development learning
- Portfolio projects
- Real estate management systems
- Understanding JWT authentication
- File-based database implementation
- Property workflow management
- Multi-role authentication systems
