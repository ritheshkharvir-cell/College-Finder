# 🎓 Bangalore College Finder

A full-stack AI-powered web application to explore, compare, and get recommendations for colleges in Bangalore, India.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🔐 Auth | JWT Signup/Login |
| 🤖 AI Chatbot | Ollama (llama3) with fallback |
| 🗺️ Map | Leaflet.js with nearest college detection |
| ⚖️ Compare | Up to 4 colleges, charts + PDF |
| 🎯 Recommend | Filter by budget, course, area |
| 📊 Dashboard | Stats, charts, top colleges |
| ❤️ Favorites | Save colleges |
| 📄 PDF Export | College details + comparison |
| 🎙️ Voice | Speech-to-text + text-to-speech |
| 🌙 Dark/Light | Theme toggle |
| 📱 Responsive | Mobile-friendly |

---

## 📁 Folder Structure

```
bangalore-college-finder/
├── backend/
│   ├── data/
│   │   └── colleges.js        ← 20 Bangalore colleges
│   ├── middleware/
│   │   └── auth.js            ← JWT middleware
│   ├── models/
│   │   ├── College.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── chat.js            ← Ollama + fallback AI
│   │   ├── colleges.js
│   │   └── favorites.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── CollegeCard.js
    │   │   └── Sidebar.js
    │   ├── context/
    │   │   ├── AuthContext.js
    │   │   └── ThemeContext.js
    │   ├── pages/
    │   │   ├── AuthPage.js
    │   │   ├── ChatPage.js
    │   │   ├── CollegeDetail.js
    │   │   ├── CollegesPage.js
    │   │   ├── ComparePage.js
    │   │   ├── Dashboard.js
    │   │   ├── FavoritesPage.js
    │   │   ├── MapPage.js
    │   │   └── RecommendPage.js
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.css
    │   └── index.js
    └── package.json
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **Ollama** (optional, for AI chat)

---

## 🛠️ Installation & Setup

### 1. Clone / Extract the project

```bash
cd bangalore-college-finder
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Edit `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bangalore_college_finder
JWT_SECRET=change_this_to_a_long_random_string
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

Start the backend:
```bash
npm run dev       # with nodemon (auto-restart)
# OR
npm start         # production
```

The server will automatically **seed the database** with 20 Bangalore colleges on first run.

### 3. Setup Frontend

```bash
cd ../frontend
npm install
npm start
```

Open **http://localhost:3000**

---

## 🤖 Setting Up Ollama (Optional - for full AI)

Without Ollama, the chatbot uses smart rule-based responses. With Ollama, it uses llama3 for full AI.

### Install Ollama

**Mac/Linux:**
```bash
curl https://ollama.ai/install.sh | sh
```

**Windows:** Download from https://ollama.ai

### Pull the model

```bash
ollama pull llama3
```

### Start Ollama

```bash
ollama serve
# Runs on http://localhost:11434
```

---

## 🌐 API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get profile |
| PUT | `/api/auth/preferences` | Update preferences |

### Colleges
| Method | Route | Description |
|---|---|---|
| GET | `/api/colleges` | List with filters |
| GET | `/api/colleges/top` | Top 6 colleges |
| GET | `/api/colleges/stats` | Dashboard stats |
| GET | `/api/colleges/nearby?lat=&lng=` | Nearby colleges |
| GET | `/api/colleges/compare?ids=` | Compare colleges |
| GET | `/api/colleges/recommend` | Filtered recommendations |
| GET | `/api/colleges/:id` | College details |

### Chat
| Method | Route | Description |
|---|---|---|
| POST | `/api/chat` | Send message to AI |
| GET | `/api/chat/history` | Get chat history |
| DELETE | `/api/chat/history` | Clear chat history |

### Favorites
| Method | Route | Description |
|---|---|---|
| GET | `/api/favorites` | Get saved colleges |
| POST | `/api/favorites/:id` | Add to favorites |
| DELETE | `/api/favorites/:id` | Remove from favorites |

---

## 🎓 Colleges in Database

1. Indian Institute of Science (IISc) — Research
2. RV College of Engineering
3. BMS College of Engineering
4. PES University
5. Manipal Institute of Technology Bangalore
6. Christ University
7. Bangalore Medical College (BMCRI)
8. St. Joseph's College of Commerce
9. Ramaiah Institute of Technology
10. Jain University
11. Dayananda Sagar College of Engineering
12. Bangalore Institute of Technology
13. National Law School of India University (NLSIU)
14. CMR Institute of Technology
15. Presidency College
16. Azim Premji University
17. MS Ramaiah Medical College
18. Alliance University
19. Garden City University
20. Reva University

---

## 🔧 Troubleshooting

**MongoDB not connecting?**
- Make sure MongoDB is running: `sudo systemctl start mongod`
- Or use MongoDB Atlas — paste connection string in `.env`

**Ollama not responding?**
- The chatbot will use its built-in rule-based fallback automatically
- To check: `curl http://localhost:11434/api/tags`

**Map not loading markers?**
- This requires internet (OpenStreetMap tiles)
- Leaflet CSS is loaded via CDN in `public/index.html`

**Port already in use?**
- Backend: change `PORT` in `.env`
- Frontend: set `PORT=3001` before `npm start`

---

## 🛡️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Chart.js, Leaflet.js |
| Styling | Custom CSS variables (dark/light) |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| AI | Ollama (llama3) with fallback |
| PDF | jsPDF + jspdf-autotable |
| Voice | Web Speech API |
| Maps | Leaflet.js + OpenStreetMap |

---

## 📝 License

MIT — free for personal and educational use.
