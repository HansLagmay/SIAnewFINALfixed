# 🏠 TES Property System v2 - Real Estate Inquiry Management

A complete professional real estate management system rebuilt with **React + Express** architecture.

## 🌟 Architecture

**Frontend:** React 18 with TypeScript, React Router v6, Tailwind CSS  
**Backend:** Express.js REST API with JSON file storage  
**Separation:** Clear `/client` and `/server` folders

## 🚀 Quick Start

```bash
# Install dependencies
npm install
cd client && npm install
cd ../server && npm install

# Run both frontend and backend
cd ..
npm run dev

# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
```

## 📋 Portal Access

- **Customer Portal:** `http://localhost:5173/` (public, no login)
- **Login Page:** `http://localhost:5173/login`
- **Admin Portal:** `http://localhost:5173/admin` (login required)
- **Agent Portal:** `http://localhost:5173/agent` (login required)
- **Super Admin:** `http://localhost:5173/superadmin` (admin only)

## 🔑 Test Accounts

**Admin:** admin@tesproperty.com / admin123  
**Agent:** maria@tesproperty.com / agent123

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- React Router v6 (no hash routing!)
- Tailwind CSS
- Axios for API calls
- Vite build tool

**Backend:**
- Express.js
- CORS middleware
- JSON file storage
- Activity logging
- RESTful API design

## 📁 Project Structure

```
├── client/          # React frontend
│   ├── src/
│   │   ├── pages/   # Portal pages
│   │   └── components/
├── server/          # Express backend (VISIBLE!)
│   ├── routes/      # API routes
│   ├── data/        # JSON files
│   └── server.js    # Main server
```

## ✅ Fixed Issues

- ✅ No more hash routing (`#dashboard` → `/admin/dashboard`)
- ✅ Login page is separate (not in customer portal)
- ✅ Backend code visible in `/server` folder
- ✅ Proper React Router navigation
- ✅ No 404 errors on refresh
- ✅ Clean URL structure

## 📝 How to Add New Agent

Use the **Super Admin Portal** at `http://localhost:5173/superadmin`

1. Login as admin
2. Navigate to Admin Portal
3. Click "HR Portal" in sidebar
4. Fill employment registration form (7 sections)
5. Submit to create agent account

## 📦 API Endpoints

- `POST /api/login` - User authentication
- `GET /api/properties` - List all properties
- `GET /api/inquiries` - List all inquiries
- `POST /api/inquiries` - Create new inquiry
- `GET /api/users` - List all users
- `POST /api/users` - Create new agent
- `GET /api/calendar` - List calendar events
- `GET /api/activity-log` - View activity logs

## 🎯 Features

### Customer Portal (Public)
- Browse properties without login
- Search and filter properties
- View property details
- Submit inquiries

### Admin Portal
- Dashboard with statistics
- Manage properties
- Handle inquiries
- Manage agents
- View activity reports
- Access HR Portal

### Agent Portal
- Personal dashboard
- View assigned inquiries
- Manage inquiry status
- View calendar events
- Browse available properties

### Super Admin (HR Portal)
- 7-section registration form
- Auto-generated secure passwords
- Complete employment records
- Benefits management

## 📖 Development

```bash
# Install all dependencies
npm run install-all

# Development mode (runs both servers)
npm run dev

# Build frontend for production
npm run build

# Start production server
npm start
```

## 🔒 Security Note

This is a demonstration system using JSON file storage. For production use:
- Implement proper database (MongoDB, PostgreSQL)
- Add JWT authentication
- Use environment variables for sensitive data
- Implement proper password hashing
- Add input validation and sanitization

## 📄 License

MIT