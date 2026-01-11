# 🏠 TES Property System v2 - Real Estate Inquiry Management

A complete professional real estate management system rebuilt with **React + Express** architecture.

## 🔒 **NEW: Production-Ready Security Features**

**Version 2.1** includes 14 critical improvements for production deployment:

### Security ✅
- ✅ **Password Hashing** - bcrypt with automatic migration
- ✅ **JWT Authentication** - 8-hour sessions, role-based access
- ✅ **Input Sanitization** - XSS protection on all inputs
- ✅ **Rate Limiting** - Brute force protection (5 login attempts/15min)
- ✅ **Session Management** - Auto-logout on expiration

### Data Integrity ✅
- ✅ **File Locking** - Race condition prevention with proper-lockfile
- ✅ **Automatic Backups** - Timestamped backups before every write (keep last 10)
- ✅ **Duplicate Prevention** - 409 status for duplicate inquiries within 7 days
- ✅ **Audit Trail** - Track all changes with user, timestamp, old/new values

### Production Features ✅
- ✅ **Image Upload** - Multer with 5MB limit, 10 images max
- ✅ **Pagination** - Server-side pagination on all endpoints
- ✅ **Error Handling** - User-friendly messages with retry options
- ✅ **Environment Config** - .env.example with all variables documented
- ✅ **Mobile Responsive** - Touch-friendly UI (44px minimum targets)

See [TESTING_IMPROVEMENTS.md](./TESTING_IMPROVEMENTS.md) for testing guide.

---

## 🛠️ Tech Stack & Frameworks

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2+ | UI library for building component-based interfaces |
| **TypeScript** | 5.3+ | Type-safe JavaScript superset for better code quality |
| **React Router** | 6.22+ | Client-side routing (BrowserRouter for clean URLs) |
| **Vite** | 5.1+ | Fast build tool and development server |
| **Tailwind CSS** | 3.4+ | Utility-first CSS framework for rapid UI development |
| **Axios** | 1.6+ | Promise-based HTTP client for API calls |

### **Backend**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime environment |
| **Express.js** | 4.18+ | Minimal web application framework for REST API |
| **bcrypt** | Latest | Password hashing with salt rounds |
| **jsonwebtoken** | Latest | JWT token generation and verification |
| **validator** | Latest | Input sanitization and validation |
| **express-rate-limit** | Latest | API rate limiting middleware |
| **proper-lockfile** | Latest | File locking for race condition prevention |
| **multer** | Latest | File upload handling |
| **CORS** | 2.8+ | Cross-Origin Resource Sharing middleware |
| **JSON Files** | - | Lightweight data storage (easily migrated to database) |

### **Languages**
- **TypeScript** (Frontend - 95% of client code)
- **JavaScript ES6+** (Backend - 100% of server code)
- **HTML5** (Semantic markup structure)
- **CSS3** (via Tailwind utility classes)
- **JSON** (Data storage format)

### **Development Tools**
- **Nodemon** - Auto-restart backend server on file changes
- **Concurrently** - Run frontend + backend simultaneously
- **ESLint** - Code linting for consistency
- **Prettier** - Code formatting

---

## 🌟 Architecture

**Pattern:** Multi-Portal Single Page Application (SPA) with REST API  
**Separation:** Clear `/client` (React) and `/server` (Express) folders  
**Routing:** React Router v6 with BrowserRouter (no hash routing)  
**State Management:** React Hooks (useState, useEffect, useContext)  
**API Communication:** RESTful endpoints with JSON responses  
**Data Storage:** JSON files in `/server/data/` (easily migrated to PostgreSQL/MongoDB)  
**Authentication:** JWT tokens with role-based access control  
**Security:** bcrypt password hashing, input sanitization, rate limiting

---

## 🎯 The 5 Portal System

TES Property System features a comprehensive **5-portal architecture**, each designed for specific user roles and workflows:

### Portal Overview

| Portal | Route | Access Level | Primary Users | Purpose |
|--------|-------|--------------|---------------|---------|
| **Customer Portal** | `/` | Public | Property seekers | Browse properties, submit inquiries |
| **Agent Portal** | `/agent` | Protected (Agent) | Sales agents | Manage assigned inquiries, schedule viewings |
| **Admin Portal** | `/admin` | Protected (Admin) | Property managers | Full property & inquiry management |
| **Super Admin Portal** | `/superadmin` | Protected (Admin) | HR/Management | Create and manage agent accounts |
| **Database Portal** | `/database` | Protected (Admin) | System administrators | Direct database access & exports |

### Detailed Portal Descriptions

#### 1️⃣ Customer Portal (Public)
**Access:** Direct at `http://localhost:5173/` - No login required  
**Features:**
- Browse all available properties with search and filters
- View detailed property information with photo galleries
- Submit property inquiries via contact form
- Fully responsive design for all devices
- **No authentication barrier** - maximizes lead generation

#### 2️⃣ Agent Portal (Protected - Agent Role)
**Access:** Login at `/login` → Auto-redirects to `/agent`  
**Features:**
- Dashboard showing all assigned inquiries
- Update inquiry status (In Progress, Viewing Scheduled, Completed)
- Add notes and track communication history
- Schedule property viewings via calendar
- View properties and track commission opportunities
- Access only to assigned inquiries (data isolation)

#### 3️⃣ Admin Portal (Protected - Admin Role)
**Access:** Login at `/login` → Auto-redirects to `/admin`  
**Features:**
- Complete dashboard with real-time statistics
- **Inquiries:** View all, assign to agents, update status, filter by status
- **Properties:** Add/edit/delete properties, change availability status
- **Agents:** View all agents, see performance stats, view workload
- **Reports:** Generate CSV exports, view activity logs
- Navigation to Super Admin and Database portals

#### 4️⃣ Super Admin Portal (HR Portal - Admin Role)
**Access:** Via Admin Portal → "HR Portal →" button or direct `/superadmin`  
**Features:**
- Comprehensive 7-section employment registration form
- Auto-generate employee IDs (EMP-YYYY-XXX format)
- Email duplicate checking in real-time
- Phone format validation (Philippine format)
- Auto-calculate probation end dates
- Create agent accounts with secure credentials
- Success modal with copyable login credentials

#### 5️⃣ Database Portal (Protected - Admin Role)
**Access:** Via Admin Portal → "Database Portal 🗄️" button or direct `/database`  
**Features:**
- Visual database management (phpMyAdmin-style interface)
- Dashboard with comprehensive statistics
- Direct access to all data tables (Properties, Inquiries, Users, Calendar, Logs)
- Export functionality (JSON/CSV) for all tables
- Track new additions (properties, inquiries, agents)
- Activity log timeline viewer
- Clear tracking lists for maintenance

### System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        PUBLIC ACCESS                             │
│  Customer Portal (/) ──> Browse Properties ──> Submit Inquiry    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Login Page    │
                    │   (/login)     │
                    └────────┬───────┘
                             │
                ┌────────────┴────────────┐
                │                         │
         ┌──────▼──────┐         ┌───────▼────────┐
         │ Agent Role  │         │  Admin Role    │
         └──────┬──────┘         └───────┬────────┘
                │                        │
                ▼                        ▼
    ┌──────────────────────┐   ┌─────────────────────┐
    │   Agent Portal       │   │   Admin Portal      │
    │   (/agent)           │   │   (/admin)          │
    │                      │   │                     │
    │ • View assigned      │   │ • Manage all        │
    │   inquiries          │   │   inquiries         │
    │ • Update status      │   │ • Assign to agents  │
    │ • Schedule viewings  │   │ • Manage properties │
    │ • Add notes          │   │ • View agent stats  │
    └──────────────────────┘   └──────┬──────────────┘
                                      │
                         ┌────────────┴───────────┐
                         │                        │
                         ▼                        ▼
              ┌────────────────────┐   ┌──────────────────┐
              │ Super Admin Portal │   │ Database Portal  │
              │   (/superadmin)    │   │   (/database)    │
              │                    │   │                  │
              │ • Create agents    │   │ • Direct DB      │
              │ • HR forms         │   │   access         │
              │ • Employee mgmt    │   │ • Export data    │
              └────────────────────┘   └──────────────────┘
```

### User Journey Examples

#### Journey 1: Property Seeker to Agent Assignment
1. **Customer** visits Customer Portal (/) without logging in
2. **Customer** browses properties, finds "Modern 2BR Condo in BGC"
3. **Customer** clicks property → Views details in modal → Clicks "Inquire Now"
4. **Customer** fills inquiry form (name, email, phone, message)
5. **System** creates inquiry with "New" status
6. **Admin** logs in → Admin Portal → Views "Inquiries" section
7. **Admin** sees new inquiry → Clicks "Assign Agent" → Selects "Maria Santos"
8. **Admin** changes status to "Assigned" → Inquiry now visible to Maria
9. **Agent (Maria)** logs in → Agent Portal → Dashboard shows 1 new inquiry
10. **Agent** clicks inquiry → Views customer details → Updates status to "In Progress"
11. **Agent** adds note: "Called customer, scheduling viewing for next week"
12. **Agent** goes to Calendar → Schedules viewing for property
13. **Agent** updates inquiry status to "Viewing Scheduled"

#### Journey 2: HR Creates New Agent Account
1. **Admin** logs in → Admin Portal dashboard
2. **Admin** clicks "HR Portal →" button in sidebar
3. **System** navigates to Super Admin Portal (/superadmin)
4. **Admin** sees 7-section employment form
5. **Admin** fills Section 1 (Personal): Name, DOB, email, phone
6. **System** auto-checks email for duplicates (real-time validation)
7. **Admin** fills remaining sections (Employment, Emergency Contact, etc.)
8. **System** auto-generates Employee ID: "EMP-2026-001"
9. **System** auto-calculates Probation End Date (Start Date + 3 months)
10. **Admin** reviews all information → Clicks "Submit & Create Account"
11. **System** creates agent account with secure credentials
12. **System** shows success modal with login credentials (email + auto-generated password)
13. **Admin** copies credentials → Sends to new agent via secure channel
14. **Admin** clicks "View All Agents" → Returns to Admin Portal
15. **New Agent** receives credentials → Logs in → Accesses Agent Portal

#### Journey 3: Database Export for Monthly Report
1. **Admin** logs in → Admin Portal
2. **Admin** clicks "Database Portal 🗄️" button in sidebar
3. **System** navigates to Database Portal (/database)
4. **Admin** views Dashboard with statistics:
   - 45 Properties, 128 Inquiries, 8 Agents
   - 23 New Inquiries, 12 Assigned, 8 In Progress
5. **Admin** clicks "Inquiries" section → Views all 128 inquiries
6. **Admin** reviews status breakdown (pie chart visualization)
7. **Admin** clicks "Export as CSV" button
8. **System** generates CSV file with all inquiry data
9. **Admin** downloads file: `inquiries_2026-01-08.csv`
10. **Admin** clicks "Properties" section
11. **Admin** clicks "Export as JSON" button
12. **System** generates JSON file: `properties_2026-01-08.json`
13. **Admin** clicks "Activity Log" section
14. **Admin** toggles "Show All Activities" (from last 10)
15. **Admin** reviews timeline: logins, adds, updates, assigns
16. **Admin** clicks "Export Activity Log"
17. **Admin** uses exported data for monthly management report

---

## 🚀 Quick Start

### Installation & Setup

```bash
# Clone the repository
git clone https://github.com/HansLagmay/SIAfrontendonlyFINAL.git
cd SIAfrontendonlyFINAL

# Install all dependencies (root, client, and server)
npm install

# Run both frontend + backend concurrently
npm run dev
```

### Portal Access Table

| Portal | URL | Login Required? | Test Account |
|--------|-----|-----------------|--------------|
| **Customer Portal** | `http://localhost:5173/` | ❌ No | N/A - Public access |
| **Login Page** | `http://localhost:5173/login` | - | Use credentials below |
| **Agent Portal** | `http://localhost:5173/agent` | ✅ Yes (Agent) | maria@tesproperty.com / agent123 |
| **Admin Portal** | `http://localhost:5173/admin` | ✅ Yes (Admin) | admin@tesproperty.com / admin123 |
| **Super Admin Portal** | `http://localhost:5173/superadmin` | ✅ Yes (Admin) | admin@tesproperty.com / admin123 |
| **Database Portal** | `http://localhost:5173/database` | ✅ Yes (Admin) | admin@tesproperty.com / admin123 |
| **Backend API** | `http://localhost:3000/api` | - | - |

### First-Time Setup Steps

1. **Start the application:**
   ```bash
   npm run dev
   ```
   This runs both frontend (port 5173) and backend (port 3000) concurrently.

2. **Verify backend is running:**
   - Open `http://localhost:3000/api/properties` in browser
   - Should see JSON array of properties

3. **Access Customer Portal (No Login):**
   - Navigate to `http://localhost:5173/`
   - Browse properties immediately without authentication

4. **Test Admin Portal:**
   - Go to `http://localhost:5173/login`
   - Enter: `admin@tesproperty.com` / `admin123`
   - Will auto-redirect to Admin Portal (`/admin`)
   - Explore: Dashboard, Inquiries, Properties, Agents, Reports

5. **Test Agent Portal:**
   - Logout from Admin Portal
   - Login with: `maria@tesproperty.com` / `agent123`
   - Will auto-redirect to Agent Portal (`/agent`)
   - View assigned inquiries and calendar

6. **Access Super Admin & Database Portals:**
   - Login as Admin
   - From Admin Portal sidebar:
     - Click "HR Portal →" for Super Admin Portal
     - Click "Database Portal 🗄️" for Database Portal

### Individual Commands (Alternative)

```bash
# Run only backend (port 3000)
cd server && npm run dev

# Run only frontend (port 5173)
cd client && npm run dev

# Build for production
npm run build
```

---

## ✅ Working Features (v2.0)

### **Customer Portal** (Public - No Authentication Required)
- ✅ Browse all available properties
- ✅ Search properties by name, location, price
- ✅ Filter by property type, bedrooms, price range
- ✅ View property details in modal with photo gallery
- ✅ Submit inquiries via contact form
- ✅ Responsive design for mobile/tablet/desktop
- ✅ **NO login button** - completely public access

### **Admin Portal** (Protected - Admin Role Only)
- ✅ Dashboard with real-time statistics (properties, inquiries, agents)
- ✅ Navigate all sections with working sidebar (no hash routing!)
- ✅ **Inquiries Management:**
  - View all customer inquiries
  - Assign inquiries to agents
  - Filter by status (New, Assigned, In Progress, etc.)
  - Update inquiry status
- ✅ **Property Management:**
  - View all properties
  - Add new properties with comprehensive form
  - Edit existing properties
  - Change property status (Available, Reserved, Sold)
- ✅ **Agent Management:**
  - View all agents
  - See agent performance stats
  - View assigned inquiries per agent
- ✅ **Reports:**
  - Generate CSV exports
  - View activity logs
- ✅ Access Super Admin Portal via "HR Portal →" button

### **Agent Portal** (Protected - Agent Role Only)
- ✅ Dashboard showing assigned inquiries
- ✅ View inquiry details
- ✅ Update inquiry status (In Progress, Viewing Scheduled, etc.)
- ✅ Add notes to inquiries
- ✅ View calendar with viewing schedules
- ✅ Schedule property viewings
- ✅ View properties and track commissions
- ✅ Navigate all sections with working sidebar

### **Super Admin Portal** (Protected - Admin Role Only)
- ✅ Employment registration form with 7 comprehensive sections
- ✅ Form validation (email format, phone format, required fields)
- ✅ Real-time email duplicate checking
- ✅ Auto-generate Employee ID (EMP-YYYY-XXX format)
- ✅ Auto-calculate probation end date (+3 months)
- ✅ Phone format validation (0917-XXX-XXXX)
- ✅ Submit agent creation to backend API
- ✅ Success modal with copyable credentials
- ✅ "Add Another Agent" or "View All Agents" options

### **Backend Database Portal** (Protected - Admin Role Only) 🗄️
- ✅ **Visual database management UI** (phpMyAdmin-style)
- ✅ **Dashboard Overview** with statistics cards:
  - Total Properties, Inquiries, Users, Calendar Events, Activity Log entries
  - Status breakdowns for inquiries
  - Recently added items count (new-properties, new-inquiries, new-agents)
  - Last database activity display
- ✅ **Properties Section:**
  - View all properties with metadata (file size, record count, last modified)
  - Display new properties list with details
  - Export to JSON/CSV
  - Clear new properties tracking list
- ✅ **Inquiries Section:**
  - View all inquiries with status breakdown
  - Display new/unassigned inquiries
  - Export and clear functionality
- ✅ **Users Section:**
  - View all users with role breakdown (admins/agents)
  - Display recently added agents
  - Export and clear functionality
- ✅ **Calendar Events Section:**
  - View all calendar events with type breakdown
  - Export functionality
- ✅ **Activity Log Viewer:**
  - Timeline view of recent activities
  - Action type icons (login, add, delete, update, assign)
  - Relative time display ("2 mins ago")
  - Toggle between last 10 and all activities
  - Export functionality
- ✅ Navigate via Admin sidebar "Database Portal 🗄️" button

---

## 🔧 API Endpoints

All endpoints available at `http://localhost:3000/api`

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Add new property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Inquiries
- `GET /api/inquiries` - Get all inquiries
- `POST /api/inquiries` - Submit new inquiry
- `PUT /api/inquiries/:id` - Update inquiry (status, assign agent, notes)

### Users/Agents
- `GET /api/users` - Get all users (excludes passwords)
- `POST /api/users` - Create new agent account
- `POST /api/login` - Login (returns user object without password)

### Calendar
- `GET /api/calendar` - Get all calendar events
- `POST /api/calendar` - Add new viewing/event
- `PUT /api/calendar/:id` - Update event
- `DELETE /api/calendar/:id` - Delete event

### Activity Log
- `GET /api/activity-log` - Get recent system activities

### Database Management
- `GET /api/database/overview` - Get database statistics
- `GET /api/database/file-metadata/:filename` - Get file metadata
- `GET /api/database/file/:filename` - Get all data from file
- `GET /api/database/recent/:type` - Get recently added items (properties/inquiries/agents)
- `POST /api/database/clear-new/:type` - Clear "new-*" tracking list
- `GET /api/database/export/:filename/csv` - Export file as CSV
- `GET /api/database/export/:filename/json` - Export file as JSON

---

## 👥 Test Accounts

### Admin Account
**Credentials:**
- Email: `admin@tesproperty.com`
- Password: `admin123`
- Role: `admin`
- Name: Admin User

**Portal Access:**
- ✅ **Admin Portal** (`/admin`) - Full access to all management features
- ✅ **Super Admin Portal** (`/superadmin`) - Create and manage agent accounts
- ✅ **Database Portal** (`/database`) - Direct database access and exports
- ❌ Agent Portal - Not accessible (wrong role)

**Capabilities:**
- Manage all properties (add, edit, delete, change status)
- View and manage all inquiries (assign to agents, update status)
- Assign inquiries to any agent
- View all agent statistics and performance
- Create new agent accounts via Super Admin Portal
- Export data and view activity logs via Database Portal
- Generate reports and CSV exports

### Agent Account (Maria Santos)
**Credentials:**
- Email: `maria@tesproperty.com`
- Password: `agent123`
- Role: `agent`
- Name: Maria Santos

**Portal Access:**
- ✅ **Agent Portal** (`/agent`) - Access to assigned inquiries only
- ❌ Admin Portal - Not accessible (wrong role)
- ❌ Super Admin Portal - Not accessible (wrong role)
- ❌ Database Portal - Not accessible (wrong role)

**Capabilities:**
- View only inquiries assigned to Maria Santos
- Update status of assigned inquiries (In Progress, Viewing Scheduled, Completed)
- Add notes and track communication with customers
- Schedule property viewings via calendar
- View all properties to assist customers
- Track commission opportunities
- Cannot assign inquiries to other agents
- Cannot create or edit properties

### Testing Scenarios

#### Scenario 1: Test Role-Based Access Control
1. Login as Agent (maria@tesproperty.com)
2. Verify redirect to `/agent` (not `/admin`)
3. Attempt to access `/admin` directly
4. Verify system blocks access (redirects to `/agent`)
5. Logout → Login as Admin
6. Verify full access to all 5 portals

#### Scenario 2: Test Inquiry Assignment Flow
1. Open Customer Portal (no login) → Submit inquiry
2. Login as Admin → Navigate to Inquiries
3. Find new inquiry → Assign to "Maria Santos"
4. Logout → Login as Agent (Maria)
5. Verify inquiry appears in Agent dashboard
6. Update inquiry status → Add notes
7. Login as Admin → Verify changes reflected in Admin Portal

#### Scenario 3: Test Agent Creation & Login
1. Login as Admin → Navigate to Super Admin Portal
2. Fill employment form with test data
3. Submit → Copy generated credentials
4. Logout → Use new credentials to login
5. Verify new agent can access Agent Portal
6. Login as Admin → Navigate to Database Portal
7. View "Users" section → Verify new agent in recent agents list

#### Scenario 4: Test Data Export
1. Login as Admin → Navigate to Database Portal
2. Export Inquiries as CSV → Verify download
3. Export Properties as JSON → Verify download
4. View Activity Log → Export activity log
5. Verify all exports contain correct data structure

#### Scenario 5: Test Cross-Portal Navigation
1. Login as Admin → Start at Admin Portal
2. Click "HR Portal →" → Verify navigation to Super Admin
3. Navigate back → Click "Database Portal 🗄️"
4. Verify Database Portal loads with correct data
5. Use browser back button → Verify returns to Admin Portal
6. Test all sidebar navigation links

---

## 🧭 Navigation Guide

### How to Access Each Portal

#### Customer Portal (Public)
**Direct Access:** `http://localhost:5173/`
- **No login required** - Open in any browser
- **Purpose:** Browse properties, submit inquiries
- **Navigation:** Uses top navbar with logo and simple menu

#### Agent Portal (Agent Role Required)
**Method 1 - Login:**
1. Go to `http://localhost:5173/login`
2. Enter agent credentials (maria@tesproperty.com / agent123)
3. System auto-redirects to `/agent`

**Method 2 - Direct:**
1. Navigate to `http://localhost:5173/agent`
2. If not logged in, redirected to login page
3. After login, redirected back to agent portal

**Navigation:** Left sidebar with sections: Dashboard, Inquiries, Calendar, Properties

#### Admin Portal (Admin Role Required)
**Method 1 - Login:**
1. Go to `http://localhost:5173/login`
2. Enter admin credentials (admin@tesproperty.com / admin123)
3. System auto-redirects to `/admin`

**Method 2 - Direct:**
1. Navigate to `http://localhost:5173/admin`
2. If not logged in, redirected to login page
3. After login, redirected back to admin portal

**Navigation:** Left sidebar with sections: Dashboard, Inquiries, Properties, Agents, Reports
**Special buttons:** "HR Portal →" and "Database Portal 🗄️" in sidebar

#### Super Admin Portal (Admin Role Required)
**Method 1 - From Admin Portal:**
1. Login as Admin
2. In Admin Portal sidebar, click "HR Portal →" button
3. Navigates to `/superadmin`

**Method 2 - Direct:**
1. Navigate to `http://localhost:5173/superadmin`
2. If not logged in, redirected to login page
3. After login, redirected to super admin portal

**Navigation:** Single-page form, use "View All Agents" button to return to Admin Portal

#### Database Portal (Admin Role Required)
**Method 1 - From Admin Portal:**
1. Login as Admin
2. In Admin Portal sidebar, click "Database Portal 🗄️" button
3. Navigates to `/database`

**Method 2 - Direct:**
1. Navigate to `http://localhost:5173/database`
2. If not logged in, redirected to login page
3. After login, redirected to database portal

**Navigation:** Top tabs: Dashboard, Properties, Inquiries, Users, Calendar, Activity Log

---

### Common Task Workflows

#### Workflow 1: Assign Inquiry to Agent
**Role Required:** Admin  
**Portal:** Admin Portal

1. Login as Admin → Navigate to Admin Portal
2. Click "Inquiries" in left sidebar
3. Find inquiry with "New" or "Unassigned" status
4. Click inquiry row to expand details
5. Click "Assign Agent" button
6. Select agent from dropdown (e.g., "Maria Santos")
7. Click "Confirm Assignment"
8. Status automatically changes to "Assigned"
9. Inquiry now visible in agent's dashboard

**Verification:**
- Logout → Login as assigned agent
- Check Agent Portal dashboard
- Verify inquiry appears in "My Inquiries" list

---

#### Workflow 2: Create New Agent Account
**Role Required:** Admin  
**Portal:** Super Admin Portal

1. Login as Admin → Navigate to Admin Portal
2. Click "HR Portal →" button in sidebar
3. System navigates to Super Admin Portal (`/superadmin`)
4. Fill **Section 1 - Personal Information:**
   - First Name, Last Name, Date of Birth
   - Email (system checks for duplicates in real-time)
   - Phone (format: 0917-XXX-XXXX)
5. Fill **Section 2 - Employment Details:**
   - Employee ID auto-generates (EMP-YYYY-XXX)
   - Select Position: "Sales Agent"
   - Set Start Date
   - Probation End Date auto-calculates (+3 months)
6. Fill **Section 3-7:** Emergency Contact, Address, Government IDs, Banking, References
7. Review all information for accuracy
8. Click "Submit & Create Account"
9. System creates agent account with auto-generated password
10. Success modal appears with credentials:
    - Email: [entered email]
    - Password: [auto-generated]
    - Copy credentials button
11. Click "Copy Credentials" → Send to new agent securely
12. Click "View All Agents" → Returns to Admin Portal

**Verification:**
- Navigate to Admin Portal → Agents section
- Verify new agent appears in list
- Navigate to Database Portal → Users section
- Verify new agent in "Recently Added Agents"

---

#### Workflow 3: View All Database Records
**Role Required:** Admin  
**Portal:** Database Portal

1. Login as Admin → Navigate to Admin Portal
2. Click "Database Portal 🗄️" button in sidebar
3. System navigates to Database Portal (`/database`)
4. **Dashboard tab** shows overview:
   - Total counts (Properties, Inquiries, Users, Events)
   - Status breakdowns with visualizations
   - Recently added items count
5. Click **"Properties"** tab:
   - View all properties in table format
   - See file metadata (size, record count, last modified)
   - Review new properties list
6. Click **"Inquiries"** tab:
   - View all inquiries with status breakdown
   - See new/unassigned inquiries
7. Click **"Users"** tab:
   - View all users (admins and agents)
   - Role breakdown statistics
   - Recently added agents list
8. Click **"Calendar"** tab:
   - View all scheduled events
   - Event type breakdown
9. Click **"Activity Log"** tab:
   - Timeline view of recent activities
   - Toggle "Show All" for complete log

**Navigation:** Use top tabs to switch between sections

---

#### Workflow 4: Update Inquiry Status
**Role Required:** Agent or Admin  
**Portal:** Agent Portal (Agent) or Admin Portal (Admin)

**As Agent:**
1. Login as Agent → Navigate to Agent Portal
2. Click "Inquiries" in left sidebar
3. View list of assigned inquiries only
4. Click on inquiry to view details
5. Review customer information and notes
6. Click "Update Status" dropdown
7. Select new status:
   - "In Progress" - Initial contact made
   - "Viewing Scheduled" - Viewing appointment set
   - "Completed" - Successfully closed
   - "Cancelled" - Customer no longer interested
8. Add note in "Add Note" section (optional)
9. Click "Save Changes"
10. Status updates immediately

**As Admin:**
1. Login as Admin → Navigate to Admin Portal
2. Click "Inquiries" in left sidebar
3. View all inquiries (not just assigned)
4. Use filters to find specific inquiries
5. Follow steps 4-10 from Agent workflow above
6. Admin can also reassign inquiries to different agents

---

#### Workflow 5: Schedule Property Viewing
**Role Required:** Agent  
**Portal:** Agent Portal

1. Login as Agent → Navigate to Agent Portal
2. Click "Calendar" in left sidebar
3. Click "Add New Event" or "Schedule Viewing" button
4. Fill event form:
   - **Title:** "Property Viewing - [Property Name]"
   - **Type:** Select "Viewing"
   - **Property:** Select from dropdown
   - **Date:** Choose viewing date
   - **Time:** Set viewing time
   - **Customer:** Enter customer name
   - **Notes:** Add any special instructions
5. Click "Save Event"
6. Event appears on calendar with color coding (Viewing = blue)
7. Return to "Inquiries" section
8. Find related inquiry → Update status to "Viewing Scheduled"
9. Add note: "Viewing scheduled for [date] at [time]"
10. Click "Save Changes"

**Verification:**
- Check calendar view (month/week/day)
- Verify event appears on correct date
- Login as Admin → View calendar in Admin Portal
- Verify admin can also see the viewing event

---

#### Workflow 6: Export Data to CSV/JSON
**Role Required:** Admin  
**Portal:** Database Portal

1. Login as Admin → Navigate to Admin Portal
2. Click "Database Portal 🗄️" button
3. Navigate to Database Portal
4. Choose section to export:
   - **For Properties:** Click "Properties" tab
   - **For Inquiries:** Click "Inquiries" tab
   - **For Users:** Click "Users" tab
   - **For Calendar:** Click "Calendar" tab
   - **For Activity Log:** Click "Activity Log" tab
5. Choose export format:
   - **CSV:** Click "Export as CSV" button
     - Downloads: `[section]_YYYY-MM-DD.csv`
     - Opens in Excel/Google Sheets
   - **JSON:** Click "Export as JSON" button
     - Downloads: `[section]_YYYY-MM-DD.json`
     - Machine-readable format
6. File downloads automatically to browser's download folder
7. Open file to verify data structure and content

**Use Cases:**
- **CSV:** Monthly reports, data analysis in Excel
- **JSON:** Data backup, system migration, API integration

---

#### Workflow 7: Clear New Items Tracking
**Role Required:** Admin  
**Portal:** Database Portal

1. Login as Admin → Navigate to Database Portal
2. Click appropriate tab (Properties, Inquiries, or Users)
3. Scroll to "Recently Added" or "New Items" section
4. Review list of new items:
   - **New Properties:** Properties added recently
   - **New Inquiries:** Recent inquiry submissions
   - **New Agents:** Recently created agent accounts
5. Verify all items have been processed/reviewed
6. Click "Clear Tracking List" button
7. Confirmation modal appears
8. Click "Confirm Clear"
9. Tracking list resets to empty
10. Items remain in database but no longer marked as "new"

**Purpose:**
- Maintain clean dashboard statistics
- Track which items have been reviewed
- Reset counters after processing batches

**Note:** This only clears the "new" flag - data is NOT deleted

---

## ⚠️ Known Limitations (Intentional for MVP)

The following features have UI but limited backend functionality:

### Not Yet Implemented (Frontend Only)
- 📧 **Email notifications** (UI exists, no email service configured)
- 📱 **SMS notifications** (UI exists, no SMS service configured)
- 💳 **Payment processing** (status changes work, no real payment gateway)
- 📊 **Advanced analytics** (basic stats work, advanced charts are mock data)
- 🔔 **Real-time notifications** (uses polling every 30s, not WebSocket)

### Production Requirements Completed ✅
- ✅ **Password hashing** - **NOW IMPLEMENTED** with bcrypt (auto-migration on startup)
- ✅ **JWT authentication** - **NOW IMPLEMENTED** (8-hour sessions, role-based access)
- ✅ **Rate limiting** - **NOW IMPLEMENTED** (login, inquiries, API limits)
- ✅ **Input sanitization** - **NOW IMPLEMENTED** (validator.escape on all inputs)
- ✅ **File locking** - **NOW IMPLEMENTED** (proper-lockfile prevents race conditions)
- ✅ **Automatic backups** - **NOW IMPLEMENTED** (timestamped, keep last 10)
- ✅ **Audit trail** - **NOW IMPLEMENTED** (tracks all changes with user/timestamp)
- ✅ **Pagination** - **NOW IMPLEMENTED** (server-side, all endpoints)
- ✅ **Image upload** - **NOW IMPLEMENTED** (multer, 5MB max, 10 images)
- ✅ **Session management** - **NOW IMPLEMENTED** (8-hour expiration, auto-logout)
- ✅ **Duplicate prevention** - **NOW IMPLEMENTED** (409 status within 7 days)
- ✅ **Error handling** - **NOW IMPLEMENTED** (useApiCall hook, user-friendly messages)
- ✅ **Environment config** - **NOW IMPLEMENTED** (.env.example provided)

### Still Using JSON Files (Easy to Migrate)
- 🗄️ **Database** (currently JSON files - easily migrate to PostgreSQL/MongoDB)
- ☁️ **Cloud storage** (currently local uploads - can add AWS S3/Cloudinary)

---

## 🐛 Debugging

### Backend not starting?
```bash
cd server
npm install
node server.js
```

### Frontend not loading?
```bash
cd client
npm install
npm run dev
```

### API calls failing?
- Check backend is running on port 3000
- Check CORS configuration in `server/server.js`
- Verify API URLs in `client/src/services/api.ts`

---

## 📂 Project Structure

```
SIAfrontendonlyFINAL/
├── client/                          # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/                   # 6 main portal pages (one per route)
│   │   │   ├── CustomerPortal.tsx   # Public property browsing (/)
│   │   │   ├── LoginPage.tsx        # Authentication page (/login)
│   │   │   ├── AdminPortal.tsx      # Admin management portal (/admin/*)
│   │   │   ├── AgentPortal.tsx      # Agent dashboard (/agent/*)
│   │   │   ├── SuperAdminPortal.tsx # HR/Agent creation (/superadmin)
│   │   │   └── DatabasePortal.tsx   # Database management (/database)
│   │   │
│   │   ├── components/              # Organized by portal/feature
│   │   │   ├── admin/               # Admin Portal components (6 files)
│   │   │   │   ├── AdminDashboard.tsx    # Statistics & overview
│   │   │   │   ├── AdminInquiries.tsx    # Inquiry management table
│   │   │   │   ├── AdminProperties.tsx   # Property CRUD operations
│   │   │   │   ├── AdminAgents.tsx       # Agent list & performance
│   │   │   │   ├── AdminReports.tsx      # Reports & exports
│   │   │   │   └── AdminSidebar.tsx      # Navigation sidebar
│   │   │   │
│   │   │   ├── agent/               # Agent Portal components (5 files)
│   │   │   │   ├── AgentDashboard.tsx    # Assigned inquiries overview
│   │   │   │   ├── AgentInquiries.tsx    # Inquiry details & status
│   │   │   │   ├── AgentProperties.tsx   # Property reference list
│   │   │   │   ├── AgentCalendar.tsx     # Viewing schedule manager
│   │   │   │   └── AgentSidebar.tsx      # Navigation sidebar
│   │   │   │
│   │   │   ├── customer/            # Customer Portal components (4 files)
│   │   │   │   ├── CustomerNavbar.tsx       # Top navigation bar
│   │   │   │   ├── PropertyList.tsx         # Property cards grid
│   │   │   │   ├── PropertyDetailModal.tsx  # Property details popup
│   │   │   │   └── InquiryModal.tsx         # Contact form popup
│   │   │   │
│   │   │   ├── database/            # Database Portal components (9 files)
│   │   │   │   ├── DatabaseDashboard.tsx  # Overview statistics
│   │   │   │   ├── PropertiesSection.tsx  # Properties table & export
│   │   │   │   ├── InquiriesSection.tsx   # Inquiries table & export
│   │   │   │   ├── UsersSection.tsx       # Users table & export
│   │   │   │   ├── CalendarSection.tsx    # Calendar events table
│   │   │   │   ├── ActivityLogViewer.tsx  # Timeline log viewer
│   │   │   │   ├── DataTable.tsx          # Reusable table component
│   │   │   │   ├── FileMetadata.tsx       # File info display
│   │   │   │   └── ExportButtons.tsx      # CSV/JSON export UI
│   │   │   │
│   │   │   └── shared/              # Shared components (1 file)
│   │   │       └── ProtectedRoute.tsx     # Auth guard HOC
│   │   │
│   │   ├── services/
│   │   │   └── api.ts               # Axios API client + endpoints
│   │   │
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces (Property, Inquiry, User, etc.)
│   │   │
│   │   ├── App.tsx                  # React Router configuration (5 routes)
│   │   ├── main.tsx                 # React entry point + Tailwind
│   │   ├── index.css                # Global styles + Tailwind directives
│   │   └── vite-env.d.ts            # Vite type definitions
│   │
│   ├── index.html                   # HTML entry point
│   ├── package.json                 # Frontend dependencies
│   ├── vite.config.ts               # Vite configuration (port 5173)
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── tsconfig.json                # TypeScript compiler config
│   └── postcss.config.js            # PostCSS for Tailwind
│
├── server/                          # Express + Node.js backend
│   ├── routes/                      # API route handlers (8 files)
│   │   ├── properties.js            # GET/POST/PUT/DELETE properties
│   │   ├── inquiries.js             # GET/POST/PUT inquiries
│   │   ├── users.js                 # GET/POST users, agent creation
│   │   ├── auth.js                  # POST login authentication
│   │   ├── calendar.js              # GET/POST/PUT/DELETE events
│   │   ├── activity-log.js          # GET activity logs
│   │   └── database.js              # Database portal endpoints (overview, export, clear)
│   │
│   ├── data/                        # JSON file storage (9 files)
│   │   ├── properties.json          # All property listings
│   │   ├── inquiries.json           # Customer inquiry submissions
│   │   ├── users.json               # Admin & agent accounts
│   │   ├── calendar-events.json     # Viewing schedules & events
│   │   ├── activity-log.json        # System activity timeline
│   │   ├── new-properties.json      # Recently added properties tracker
│   │   ├── new-inquiries.json       # New inquiry tracker
│   │   └── new-agents.json          # Recently added agents tracker
│   │
│   ├── middleware/
│   │   └── logger.js                # Activity logging middleware
│   │
│   ├── utils/
│   │   └── fileOperations.js        # Read/write JSON file helpers
│   │
│   ├── server.js                    # Express server entry point (port 3000)
│   └── package.json                 # Backend dependencies
│
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── package.json                     # Root scripts (concurrently runs client + server)
├── package-lock.json                # Dependency lock file
├── README.md                        # This documentation file
└── TESTING.md                       # Testing documentation
```

### Component Breakdown by Portal

#### Customer Portal Components (4 files)
- **CustomerNavbar.tsx** - Top navigation with logo, links
- **PropertyList.tsx** - Grid of property cards with search/filter
- **PropertyDetailModal.tsx** - Full property details with image gallery
- **InquiryModal.tsx** - Contact form for property inquiries

#### Agent Portal Components (5 files)
- **AgentDashboard.tsx** - Overview of assigned inquiries + quick stats
- **AgentInquiries.tsx** - Detailed inquiry list with status updates
- **AgentProperties.tsx** - Property catalog for reference
- **AgentCalendar.tsx** - Viewing schedule management (add/edit events)
- **AgentSidebar.tsx** - Left navigation menu

#### Admin Portal Components (6 files)
- **AdminDashboard.tsx** - System-wide statistics dashboard
- **AdminInquiries.tsx** - All inquiries with assign/filter/status update
- **AdminProperties.tsx** - Full property CRUD with forms
- **AdminAgents.tsx** - Agent list with performance metrics
- **AdminReports.tsx** - Export tools and activity logs
- **AdminSidebar.tsx** - Left navigation + HR/Database portal buttons

#### Database Portal Components (9 files)
- **DatabaseDashboard.tsx** - Overview with statistics cards
- **PropertiesSection.tsx** - Properties data table + new items list
- **InquiriesSection.tsx** - Inquiries data table + status breakdown
- **UsersSection.tsx** - Users data table + role breakdown
- **CalendarSection.tsx** - Calendar events data table
- **ActivityLogViewer.tsx** - Timeline view of system activities
- **DataTable.tsx** - Reusable table component for all sections
- **FileMetadata.tsx** - Display file size, record count, last modified
- **ExportButtons.tsx** - CSV/JSON export button component

### Key File Purposes

#### Frontend Core Files
- **App.tsx** - Defines all 5 portal routes + protected route wrappers
- **services/api.ts** - Axios client with all API endpoint functions
- **types/index.ts** - TypeScript interfaces (Property, Inquiry, User, CalendarEvent, etc.)
- **components/shared/ProtectedRoute.tsx** - Authentication guard for admin/agent routes

#### Backend Core Files
- **server.js** - Express server setup, CORS config, route registration, port 3000
- **middleware/logger.js** - Logs all API activities to activity-log.json
- **utils/fileOperations.js** - Helper functions for reading/writing JSON files

#### API Route Files
- **routes/properties.js** - Property CRUD endpoints
- **routes/inquiries.js** - Inquiry submission and management
- **routes/users.js** - User/agent management + creation
- **routes/auth.js** - Login authentication logic
- **routes/calendar.js** - Calendar event CRUD
- **routes/activity-log.js** - Fetch activity logs
- **routes/database.js** - Database portal special endpoints (overview, metadata, export, clear tracking)

#### Data Files (JSON Storage)
- **properties.json** - Main property database
- **inquiries.json** - Customer inquiry submissions
- **users.json** - Admin and agent accounts (includes passwords - plain text)
- **calendar-events.json** - Scheduled viewings and events
- **activity-log.json** - System activity timeline (login, add, update, delete, assign)
- **new-properties.json** - Tracking list for recently added properties
- **new-inquiries.json** - Tracking list for new inquiry submissions
- **new-agents.json** - Tracking list for recently created agent accounts

### Data Flow Example: Submit Inquiry

```
Customer Portal (Frontend)
    ↓ (User fills inquiry form)
InquiryModal.tsx
    ↓ (Calls api.submitInquiry())
services/api.ts
    ↓ (POST /api/inquiries)
        → NETWORK →
server.js (Backend)
    ↓ (Routes to inquiries handler)
routes/inquiries.js
    ↓ (Calls fileOps.readData())
utils/fileOperations.js
    ↓ (Reads from disk)
data/inquiries.json
    ↓ (Adds new inquiry)
data/inquiries.json (Updated)
    ↓ (Logs activity)
middleware/logger.js
    ↓ (Writes log entry)
data/activity-log.json
    ↓ (Returns success)
        ← NETWORK ←
InquiryModal.tsx
    ↓ (Shows success message)
Customer sees confirmation
```

---

## 📝 License

MIT License - This is a demo/educational project.