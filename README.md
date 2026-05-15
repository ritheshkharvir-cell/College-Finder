# Bangalore College Finder

A full-stack web app for exploring, comparing, and getting recommendations for colleges in Bangalore, India. It includes authentication, college discovery, favorites, map-based nearby search, comparison tools, dashboards, and an AI chat assistant with an Ollama-powered option.

## Features

| Feature | Description |
| --- | --- |
| Authentication | JWT signup, login, and profile access |
| AI chatbot | Ollama llama3 integration with a built-in fallback |
| Map view | Leaflet map with nearby college detection |
| Compare | Compare up to four colleges with charts and PDF export |
| Recommendations | Filter colleges by budget, course, area, and preferences |
| Dashboard | College stats, charts, and top colleges |
| Favorites | Save and remove favorite colleges |
| Voice support | Speech-to-text and text-to-speech support |
| Theme toggle | Dark and light mode |
| Responsive UI | Works across desktop and mobile screens |

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, React Router 6, Chart.js, Leaflet.js |
| Styling | Custom CSS variables |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| AI | Ollama llama3 with fallback responses |
| PDF | jsPDF, jspdf-autotable |
| Maps | Leaflet.js, OpenStreetMap |

## Project Structure

```text
bangalore-college-finder/
├── backend/
│   ├── data/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB, either local or Atlas
- Ollama, optional for full local AI chat

## Setup

Install backend and frontend dependencies:

```bash
npm run install:all
```

Create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

Update `backend/.env` with your own MongoDB connection string and JWT secret:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bangalore_college_finder
JWT_SECRET=change_this_to_a_long_random_string
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3
NODE_ENV=development
```

Start the backend:

```bash
npm run dev:backend
```

Start the frontend in another terminal:

```bash
npm run start:frontend
```

Open `http://localhost:3000`.

## Ollama Setup

The chatbot works without Ollama by using fallback responses. To use local AI responses:

```bash
ollama pull llama3
ollama serve
```

Ollama should run at `http://localhost:11434`.

## API Endpoints

### Auth

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/auth/signup` | Register a user |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get current profile |
| PUT | `/api/auth/preferences` | Update preferences |

### Colleges

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/colleges` | List colleges with filters |
| GET | `/api/colleges/top` | Get top colleges |
| GET | `/api/colleges/stats` | Get dashboard stats |
| GET | `/api/colleges/nearby?lat=&lng=` | Find nearby colleges |
| GET | `/api/colleges/compare?ids=` | Compare colleges |
| GET | `/api/colleges/recommend` | Get recommendations |
| GET | `/api/colleges/:id` | Get college details |

### Chat

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/chat` | Send a message |
| GET | `/api/chat/history` | Get chat history |
| DELETE | `/api/chat/history` | Clear chat history |

### Favorites

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/favorites` | Get saved colleges |
| POST | `/api/favorites/:id` | Add a favorite |
| DELETE | `/api/favorites/:id` | Remove a favorite |

## Notes

- `backend/.env` is intentionally ignored by Git because it may contain secrets.
- `node_modules` folders are intentionally ignored. Reinstall dependencies with `npm run install:all`.
- On first run, the backend seeds the database with the bundled Bangalore college data.

## License

MIT
