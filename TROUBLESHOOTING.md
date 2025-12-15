# Troubleshooting Guide

## "Failed to fetch" Error

If you're seeing a "Failed to fetch" error when trying to use the Copilot Assistant, it usually means the backend server is not running.

### Solution:

1. **Make sure the backend server is running:**
   ```bash
   # From the root directory
   npm run dev:server
   
   # OR from the server directory
   cd server
   npm run dev
   ```

2. **Check if the server is running:**
   - Open your browser and go to: `http://localhost:3001/health`
   - You should see: `{"status":"ok","message":"Proofreading Assistant API is running"}`

3. **Verify your .env file:**
   - Make sure you have a `.env` file in the root directory
   - It should contain:
     ```env
     PORT=3001
     GEMINI_API_KEY=your_actual_api_key_here
     CORS_ORIGIN=http://localhost:5173
     VITE_API_URL=http://localhost:3001/api
     ```

4. **Check the console:**
   - Look for any errors in the server console
   - Common issues:
     - Missing `GEMINI_API_KEY` in `.env`
     - Port 3001 already in use
     - Node modules not installed

### Running Both Frontend and Backend:

From the root directory:
```bash
npm run dev
```

This will start both frontend (port 5173) and backend (port 3001) simultaneously.

### Port Already in Use:

If port 3001 is already in use:
1. Change the `PORT` in your `.env` file
2. Update `VITE_API_URL` to match the new port
3. Restart the server

