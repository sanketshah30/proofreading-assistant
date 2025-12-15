# Proofreading Assistant - Frontend

React frontend application for the Proofreading Assistant.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
VITE_API_URL=http://localhost:3001/api
```

## Development

```bash
npm run dev
```

The app will run on `http://localhost:5173`

## Build

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   │   ├── copilot/     # Copilot assistant
│   │   ├── editor/      # Document editor
│   │   └── layout/      # Layout components
│   ├── services/        # API services
│   ├── types/          # TypeScript types
│   ├── styles/         # Global styles
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main app
│   └── main.tsx        # Entry point
├── public/             # Static assets
└── index.html          # HTML template
```

