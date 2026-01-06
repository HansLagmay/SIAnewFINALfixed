# 🏠 TES Property System v2 - Real Estate Inquiry Management

A complete professional real estate management system rebuilt with **React + Express** architecture.

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
**Authentication:** LocalStorage session management (JWT recommended for production)

---

## 🚀 Quick Start

```bash
# Install all dependencies
npm install

# Run both frontend + backend concurrently
npm run dev

# Access portals:
# - Customer Portal:   http://localhost:5173/
# - Login Page:        http://localhost:5173/login
# - Admin Portal:      http://localhost:5173/admin
# - Agent Portal:      http://localhost:5173/agent
# - Super Admin Portal: http://localhost:5173/superadmin
# - Backend API:       http://localhost:3000/api
```

### Individual Commands
```bash
# Run only backend
cd server && npm run dev

# Run only frontend
cd client && npm run dev
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

---

## 👥 Test Accounts

### Admin
- Email: `admin@tesproperty.com`
- Password: `admin123`
- Access: Admin Portal + Super Admin Portal

### Agent
- Email: `maria@tesproperty.com`
- Password: `agent123`
- Access: Agent Portal

---

## ⚠️ Known Limitations (Intentional for MVP)

The following features have UI but limited backend functionality:

### Not Yet Implemented (Frontend Only)
- 📧 **Email notifications** (UI exists, no email service configured)
- 📱 **SMS notifications** (UI exists, no SMS service configured)
- 💳 **Payment processing** (status changes work, no real payment gateway)
- 📊 **Advanced analytics** (basic stats work, advanced charts are mock data)
- 🔔 **Real-time notifications** (uses polling every 30s, not WebSocket)

### Production Requirements Not Included
- 🔐 **Password hashing** (currently plain text - use bcrypt in production)
- 🗄️ **Database** (currently JSON files - migrate to PostgreSQL/MongoDB)
- 🔑 **JWT authentication** (currently LocalStorage - implement JWT tokens)
- ☁️ **Cloud storage** (images as base64 - use AWS S3/Cloudinary)
- 🔒 **Rate limiting** (no API rate limiting implemented)
- ✅ **Input sanitization** (basic validation only - add DOMPurify)

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
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/             # Main portal pages
│   │   ├── components/        # Reusable components (by portal)
│   │   ├── services/api.ts    # Axios API client
│   │   ├── types/index.ts     # TypeScript type definitions
│   │   ├── App.tsx            # Main router configuration
│   │   └── main.tsx           # React entry point
│   └── package.json
│
├── server/                    # Express backend
│   ├── routes/                # API route handlers
│   ├── data/                  # JSON file storage
│   ├── middleware/logger.js   # Activity logging middleware
│   ├── utils/fileOps.js       # File read/write helpers
│   ├── server.js              # Express server entry point
│   └── package.json
│
├── .env.example               # Environment variables template
├── package.json               # Root scripts (dev, build)
└── README.md                  # This file
```

---

## 📝 License

MIT License - This is a demo/educational project.