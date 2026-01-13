# 🏠 TES Property System v2.1 - Real Estate Inquiry Management

A complete professional real estate management system with **React + Express** architecture, using **JSON file-based database** for simplicity and portability.

## 🎯 Project Overview

**No external database required!** This system uses JSON files for data storage, making it perfect for:
- Development and testing
- Portfolio demonstrations  
- Quick deployments
- Learning full-stack development

All you need is **VS Code** and **Node.js**.

---

## 🔒 Security Features (Version 2.1)

### ✅ Implemented Security
- **Password Hashing** - bcrypt with 10 salt rounds
- **JWT Authentication** - 8-hour session tokens
- **Input Sanitization** - XSS protection on all user inputs
- **Rate Limiting** - Brute force protection (5 login attempts/15min)
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
git clone https://github.com/HansLagmay/SIAfrontendonlyFINAL.git
cd SIAfrontendonlyFINAL
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
- **Access**: All features (properties, inquiries, agents, database, reports)

### Agent Account
- **Email**: `maria@tesproperty.com`
- **Password**: `agent123`
- **Access**: Own inquiries, calendar, available properties

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

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/properties` | Get all properties | ❌ Public |
| GET | `/api/properties/:id` | Get single property | ❌ Public |
| POST | `/api/properties` | Create property | ✅ Admin |
| PUT | `/api/properties/:id` | Update property | ✅ Admin |
| DELETE | `/api/properties/:id` | Delete property | ✅ Admin |
| POST | `/api/properties/upload` | Upload images | ✅ Admin |

### Inquiries

| Method | Endpoint | Description | Auth Required | Rate Limited |
|--------|----------|-------------|---------------|--------------|
| POST | `/api/inquiries` | Submit inquiry | ❌ Public | ✅ 3/hour |
| GET | `/api/inquiries` | Get all inquiries | ✅ Admin/Agent | ❌ |
| GET | `/api/inquiries/:id` | Get single inquiry | ✅ Admin/Agent | ❌ |
| PUT | `/api/inquiries/:id` | Update inquiry | ✅ Admin/Agent | ❌ |
| POST | `/api/inquiries/:id/claim` | Agent claims inquiry | ✅ Agent | ❌ |
| POST | `/api/inquiries/:id/assign` | Admin assigns inquiry | ✅ Admin | ❌ |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all users | ✅ Admin |
| GET | `/api/users/agents` | Get all agents | ✅ Admin |
| POST | `/api/users` | Create agent | ✅ Admin |
| DELETE | `/api/users/:id` | Delete user | ✅ Admin |

### Calendar

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/calendar` | Get all events | ✅ Admin/Agent |
| GET | `/api/calendar/agent/:id` | Get agent events | ✅ Agent |
| POST | `/api/calendar` | Create event | ✅ Admin/Agent |
| PUT | `/api/calendar/:id` | Update event | ✅ Admin/Agent |
| DELETE | `/api/calendar/:id` | Delete event | ✅ Admin/Agent |

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

### Activity Log

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/activity-log` | Get activity logs | ✅ Admin |

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
SIAfrontendonlyFINAL/
├── client/                       # Frontend React application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── admin/          # Admin portal components
│   │   │   ├── agent/          # Agent portal components
│   │   │   ├── customer/       # Customer portal components
│   │   │   ├── database/       # Database portal components
│   │   │   └── shared/         # Shared components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services (Axios)
│   │   ├── types/              # TypeScript type definitions
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
│   │   ├── fileOperations.js   # JSON file read/write
│   │   ├── migrate.js          # Password migration
│   │   └── sanitize.js         # Input sanitization utilities
│   ├── server.js               # Express server entry point
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
- Wait 15 minutes for login rate limit to reset
- Wait 1 hour for inquiry rate limit to reset
- Clear tracking in `node_modules/express-rate-limit/` (dev only)

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

## 🎯 Features Roadmap

### ✅ Completed (v2.1)
- JWT authentication
- Password hashing (bcrypt)
- Input sanitization
- Rate limiting
- File-based database with backups
- Multi-role system (Admin/Agent)
- Image upload
- Activity logging
- Database portal

### 🔄 In Progress
- Email notifications
- Advanced search filters
- Property comparison feature

### 📋 Planned (v2.2)
- Two-factor authentication (2FA)
- Real-time notifications (WebSockets)
- Advanced analytics dashboard
- Mobile responsive improvements
- Dark mode theme

### 🚀 Future (v3.0)
- Migration to PostgreSQL/MongoDB
- GraphQL API
- Mobile app (React Native)
- Multi-language support
- AI-powered property recommendations

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

**Version:** 2.1.0  
**Last Updated:** January 13, 2026  
**Maintained by:** HansLagmay

---

⭐ **Star this repo if you find it helpful!**

🎓 **Perfect for:**
- Full-stack development learning
- Portfolio projects
- Real estate management systems
- Understanding JWT authentication
- File-based database implementation
