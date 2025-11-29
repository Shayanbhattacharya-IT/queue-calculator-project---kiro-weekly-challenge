# Quick Queue - Troubleshooting Guide

## Issue: Unable to Add/Submit

If you're experiencing issues with adding wait time reports or joining queues, follow these steps:

### Step 1: Verify Both Servers Are Running

**Backend (Port 3001):**
```bash
cd backend
npm start
```
Should show: `Quick Queue API running on port 3001`

**Frontend (Port 3000):**
```bash
cd frontend
npm run dev
```
Should show: `Local: http://localhost:3000/`

### Step 2: Clear Browser Cache and Refresh

1. Open http://localhost:3000 in your browser
2. Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac) to hard refresh
3. Or press `F12` to open DevTools, right-click the refresh button, select "Empty Cache and Hard Reload"

### Step 3: Check Browser Console for Errors

1. Press `F12` to open Developer Tools
2. Click on the "Console" tab
3. Look for any red error messages
4. Common errors and solutions:

**Error: "Failed to fetch"**
- Solution: Make sure backend is running on port 3001
- Check: `http://localhost:3001/health` should return `{"status":"ok"}`

**Error: "Network request failed"**
- Solution: Check if proxy is working
- Restart frontend: `npm run dev`

**Error: "Cannot read property of undefined"**
- Solution: Hard refresh the browser (Ctrl + Shift + R)

### Step 4: Test the APIs Directly

**Test Backend Health:**
Open in browser: `http://localhost:3001/health`
Should return: `{"status":"ok"}`

**Test Get Locations:**
Open in browser: `http://localhost:3001/api/locations`
Should return: Array of locations with banks, hotels, etc.

**Test Get Categories:**
Open in browser: `http://localhost:3001/api/categories`
Should return: Array of categories including Banks, Hotels, etc.

### Step 5: Verify Form Functionality

**To Submit a Wait Time Report:**
1. Go to http://localhost:3000
2. In "Report Wait Time" section:
   - (Optional) Select a category from "Filter by Category" dropdown
   - Select a location from "Location" dropdown
   - Enter a number in "Wait Time (minutes)" field
   - Click "Submit Report" button
3. You should see: "Wait time reported successfully!" message
4. Dashboard should update with your report

**To Join a Queue:**
1. Select a location from the dropdown
2. The "🎫 Join Queue at This Location" button should appear
3. Click the button
4. You should see an alert: "You are #X in queue. Estimated wait: Y minutes"
5. A queue card should appear at the top of the page

### Step 6: Check Network Tab

1. Press `F12` to open Developer Tools
2. Click on the "Network" tab
3. Try submitting a report or joining a queue
4. Look for the API calls:
   - `POST /api/reports` - Should return status 201
   - `POST /api/queue/join` - Should return status 201
5. Click on the failed request (if any) to see details

### Step 7: Reset Database (If Data Issues)

If you're seeing "location not found" or similar errors:

```bash
cd backend
node reset-db.js
npm start
```

This will:
- Drop all tables
- Recreate tables
- Seed categories
- Add sample locations (banks, hotels, etc.)

### Step 8: Check localStorage

1. Press `F12` to open Developer Tools
2. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Click on "Local Storage" → `http://localhost:3000`
4. You should see: `quickQueueUserId` with a value like `user_1234567890_abc123`
5. If missing, refresh the page - it should be created automatically

### Common Issues and Solutions

#### Issue: Location dropdown is empty
**Solution:**
1. Check browser console for errors
2. Verify backend is running: `http://localhost:3001/api/locations`
3. Reset database: `node reset-db.js` in backend folder
4. Hard refresh browser

#### Issue: "Join Queue" button doesn't appear
**Solution:**
1. Make sure you've selected a location first
2. Check that `locationId` state is set (use React DevTools)
3. Hard refresh browser

#### Issue: Queue card doesn't appear after joining
**Solution:**
1. Check browser console for errors
2. Verify userId is set in localStorage
3. Check Network tab for `/api/queue/join` response
4. Hard refresh and try again

#### Issue: Category filter doesn't work
**Solution:**
1. Select a category (e.g., "Banks")
2. Location dropdown should update automatically
3. If not, check console for errors
4. Hard refresh browser

#### Issue: Notifications don't work
**Solution:**
1. Click "Enable Notifications" button when prompted
2. Or go to browser settings and allow notifications for localhost:3000
3. Join a queue to test
4. Note: Notifications only appear when 15 minutes or less remaining

### Debug Mode

To see detailed logs, open browser console (F12) and check for:
- `Failed to load locations:` - Backend connection issue
- `Failed to join queue:` - Queue API issue
- `Failed to load queue status:` - Queue status API issue

### Still Having Issues?

1. **Restart Everything:**
   ```bash
   # Stop all processes (Ctrl+C in each terminal)
   
   # Backend
   cd backend
   node reset-db.js
   npm start
   
   # Frontend (in new terminal)
   cd frontend
   npm run dev
   ```

2. **Clear Everything:**
   - Close all browser tabs
   - Clear browser cache completely
   - Delete localStorage (F12 → Application → Local Storage → Clear All)
   - Restart browser
   - Open http://localhost:3000

3. **Check Ports:**
   - Make sure nothing else is using port 3000 or 3001
   - On Windows: `netstat -ano | findstr :3000`
   - On Windows: `netstat -ano | findstr :3001`

### Success Checklist

✅ Backend running on port 3001
✅ Frontend running on port 3000
✅ Browser shows Quick Queue interface
✅ Location dropdown shows banks, hotels, etc.
✅ Can select category and see filtered locations
✅ Can submit wait time report
✅ Can join queue
✅ Queue card appears after joining
✅ Dashboard shows locations with wait times

If all checkboxes are ✅, everything is working correctly!

### Getting Help

If you're still experiencing issues:
1. Note the exact error message from browser console
2. Note which step you're stuck on
3. Check if backend logs show any errors
4. Provide the error details for further assistance
