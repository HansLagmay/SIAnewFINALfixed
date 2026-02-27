# Multi-Session Support Guide

## Overview
The application now supports multiple concurrent sessions for agents and admins. This is particularly useful for demo purposes when you want to show different user perspectives simultaneously.

## How It Works

### Session Storage
- Each user's session is stored separately using their unique user ID
- Sessions are stored in `localStorage` (persistent across browser restarts)
- Active session per tab is tracked in `sessionStorage` (tab-specific)

### Key Features
1. **Independent Sessions**: Each logged-in user maintains their own session data
2. **Tab-Specific**: Each browser tab remembers which user is active in that tab
3. **Session Switcher**: UI component to switch between multiple logged-in accounts
4. **Persistent**: Sessions remain even after browser refresh

## Using Multiple Sessions for Demos

### Method 1: Multiple Browser Tabs (Recommended)
1. Open your application in a browser tab
2. Log in as Agent 1 (e.g., maria@tesproperty.com)
3. Open a new tab with the same application URL
4. Log in as Agent 2 (e.g., another agent account)
5. Both tabs will now work independently with their respective agents

### Method 2: Session Switcher Widget
1. Log in as Agent 1
2. Open another browser tab and log in as Agent 2
3. Go back to the first tab
4. Look for the "2 Active Sessions" button in the sidebar
5. Click it to see all logged-in agents
6. Click on any agent to switch to their session instantly

### Method 3: Different Browser Profiles
For complete isolation, use different browser profiles or different browsers entirely (Chrome, Firefox, Edge, etc.)

## Visual Indicators

### Session Switcher Button
- Location: Top of the sidebar under user info
- Appearance: Blue rounded button showing "X Active Sessions"
- Only appears when multiple sessions exist

### Session List
- Shows all currently logged-in users for the current role
- Active session is highlighted with blue background
- Click any session to switch instantly
- Click the X button to log out that specific session

## Technical Details

### For Developers

#### Session Key Structure
```
localStorage:
  - session_user_{userId}: Individual user session data
  - active_session_{role}: Last logged-in user (fallback)

sessionStorage:
  - active_session_{role}: Current tab's active user
```

#### API Functions
```typescript
// Get sessions for a role
getSessionsForRole('agent'): Session[]

// Switch to different user session
switchSession(userId, 'agent'): boolean

// Clear specific user session
clearSession('agent', userId)

// Clear all sessions for a role
clearAllSessionsForRole('agent')
```

## Demo Scenarios

### Scenario 1: Comparing Agent Dashboards
1. Log in as two different agents in separate tabs
2. Navigate both to the dashboard
3. Compare their assigned properties, commissions, etc.

### Scenario 2: Real-time Updates
1. Log in as Agent 1 and Agent 2
2. As Agent 1, update a property or inquiry
3. Watch the changes reflect in both sessions

### Scenario 3: Different Permissions
1. Log in as Admin and Agent
2. Show how admin sees all data
3. Show how agent only sees their assigned data

## Limitations

- Browser storage limits apply (typically 5-10MB for localStorage)
- All tabs share the same session data (by design)
- Sessions expire after 30 days of inactivity

## Troubleshooting

### Sessions Not Persisting
- Check browser's localStorage is enabled
- Clear browser cache and try again

### Can't Switch Sessions
- Ensure you're logged in as multiple users
- Refresh the page to reload session data

### Wrong User Showing
- Clear all sessions using browser DevTools
- Log in fresh with desired accounts

## Security Note

This multi-session feature is designed for **demo and development purposes**. In a production environment with security concerns, you may want to:
- Limit to one session per role
- Add session management UI for security
- Implement proper session timeout and renewal
- Add audit logging for session switches
