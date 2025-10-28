const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 🟢 MongoDB connection (using Compass/local)
mongoose.connect('mongodb://localhost:27017/travelbook', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB Compass'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
  res.send('TravelBook Backend Running!');
});

// Trip routes
const tripRoutes = require('./routes/trips');
app.use('/api/trips', tripRoutes);

// 🧩 Temporary test: insert a user into MongoDB
const User = mongoose.model('User', new mongoose.Schema({
  email: String,
  password: String
}));

app.get('/api/add-user', async (req, res) => {
  try {
    const newUser = await User.create({
      email: 'test@example.com',
      password: '123456'
    });
    res.json(newUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
