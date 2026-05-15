require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const College = require('./models/College');
const collegesData = require('./data/colleges');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/colleges', require('./routes/colleges'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/favorites', require('./routes/favorites'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Bangalore College Finder API running' });
});

// Seed database with college data
async function seedDatabase() {
  try {
    const count = await College.countDocuments();
    if (count === 0) {
      await College.insertMany(collegesData);
      console.log(`✅ Seeded ${collegesData.length} colleges to database`);
    } else {
      console.log(`📚 Database already has ${count} colleges`);
    }
  } catch (error) {
    console.error('Seeding error:', error.message);
  }
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await seedDatabase();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Ollama URL: ${process.env.OLLAMA_URL}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
