# Proofreading Assistant

AI-powered proofreading assistant for researchers, built with React, TypeScript, and Google Gemini AI.

## Project Structure

```
proofreading-assistant/
├── frontend/          # React frontend application
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
├── server/           # Express backend server
│   ├── src/          # Server source code
│   └── package.json  # Server dependencies
└── package.json      # Root workspace configuration
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Google Gemini API key

## Setup

### 1. Install Dependencies

Install all dependencies (root, frontend, and server):

```bash
npm run install:all
```

Or install individually:

```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend
npm install

# Server dependencies
cd ../server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the **root directory**:

```env
# Server Configuration
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGIN=http://localhost:5173

# Frontend Configuration
VITE_API_URL=http://localhost:3001/api
```

Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

**Note:** Both frontend and server read from the same root `.env` file for easier management.

## Development

### Run Both Frontend and Backend (from root)

```bash
# From the root directory
npm run dev
```

This will start:
- Frontend on `http://localhost:5173`
- Backend on `http://localhost:3001`

### Run Individually

**Frontend only:**
```bash
# From root
npm run dev:frontend

# OR from frontend directory
cd frontend
npm run dev
```

**Backend only:**
```bash
# From root
npm run dev:server

# OR from server directory
cd server
npm run dev
```

## Build

### Build All

```bash
npm run build
```

### Build Individually

```bash
# Frontend
npm run build:frontend

# Backend
npm run build:server
```

## Features

- **Document Editor**: Rich text editor with formatting toolbar
- **AI Copilot Assistant**: Chat-based AI assistant powered by Gemini
- **Grammar Checking**: Automated grammar and style suggestions
- **Text Selection Menu**: Context-aware AI suggestions for selected text
- **Real-time Suggestions**: Get suggestions with line numbers and context
- **Apply/Copy/Dismiss**: Easy action buttons for each suggestion

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Framer Motion
- React Icons

### Backend
- Node.js
- Express
- TypeScript
- Google Gemini AI

## API Endpoints

### POST `/api/chat`
Send a chat message with document content for analysis.

**Request:**
```json
{
  "documentContent": "Your document text...",
  "userQuery": "Check grammar",
  "conversationHistory": []
}
```

**Response:**
```json
{
  "content": "AI response text",
  "suggestions": [
    {
      "id": "suggestion-1",
      "type": "grammar",
      "original": "text to replace",
      "suggested": "replacement text",
      "context": "surrounding context",
      "lineNumber": 5,
      "reason": "explanation"
    }
  ]
}
```

## Project Structure Details

### Frontend (`frontend/`)
```
frontend/
├── src/
│   ├── components/      # React components
│   │   ├── copilot/     # Copilot assistant components
│   │   ├── editor/      # Document editor components
│   │   └── layout/      # Layout components (Header, Sidebar)
│   ├── services/        # API services
│   ├── types/          # TypeScript types
│   ├── styles/         # Global styles
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── public/             # Static assets
├── index.html          # HTML template
└── package.json        # Frontend dependencies
```

### Server (`server/`)
```
server/
├── src/
│   ├── routes/         # API routes
│   ├── services/       # Business logic (Gemini service)
│   ├── types/         # TypeScript types
│   └── server.ts      # Express server setup
├── .env               # Environment variables
└── package.json       # Server dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
