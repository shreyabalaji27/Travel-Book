// routes/trips.js
const express = require('express');
const Trip = require('../models/Trip');
const jwt = require('jsonwebtoken');

const router = express.Router();

// middleware to protect routes (very basic)
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if(!authHeader) return res.status(401).json({ message: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// create trip (protected)
router.post('/', auth, async (req, res) => {
  try {
    const data = req.body;
    data.createdBy = req.userId;
    const trip = new Trip(data);
    await trip.save();
    res.json(trip);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// list trips (public) - allow query by origin/destination/type
router.get('/', async (req, res) => {
  try {
    const filter = {};
    const { origin, destination, type } = req.query;
    if(origin) filter.origin = new RegExp(origin, 'i');
    if(destination) filter.destination = new RegExp(destination, 'i');
    if(type) filter.type = type;
    const trips = await Trip.find(filter).limit(100).sort({ departure: 1 });
    res.json(trips);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// get single trip
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if(!trip) return res.status(404).json({ message: 'Not found' });
    res.json(trip);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
