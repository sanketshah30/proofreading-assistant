# Proofreading Assistant Backend

Backend server for the Proofreading Assistant application, powered by Google Gemini AI.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the **root directory** (not in server folder):
```env
# Server Configuration
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGIN=http://localhost:5173

# Frontend Configuration
VITE_API_URL=http://localhost:3001/api
```

3. Get your Gemini API key:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy it to your `.env` file

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The server will run on `http://localhost:3001` by default.

## API Endpoints

### POST `/api/chat`
Sends a chat message with document content for analysis.

**Request Body:**
```json
{
  "documentContent": "Your document text here...",
  "userQuery": "Check this document for grammar errors",
  "conversationHistory": [
    {
      "id": "1",
      "type": "user",
      "content": "Previous message",
      "timestamp": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Response:**
```json
{
  "content": "I found several grammar issues...",
  "suggestions": [
    {
      "id": "suggestion-1",
      "type": "grammar",
      "original": "&",
      "suggested": "and",
      "context": "Health concerns & nourishment needs",
      "lineNumber": 3,
      "reason": "Use 'and' instead of '&' in formal writing"
    }
  ]
}
```

### GET `/health`
Health check endpoint.

## Environment Variables

- `PORT`: Server port (default: 3001)
- `GEMINI_API_KEY`: Your Google Gemini API key (required)
- `CORS_ORIGIN`: Frontend origin for CORS (default: http://localhost:5173)

