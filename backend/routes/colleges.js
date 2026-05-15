const express = require('express');
const router = express.Router();
const College = require('../models/College');
const { protect } = require('../middleware/auth');

// @route GET /api/colleges - Get all colleges with filters
router.get('/', async (req, res) => {
  try {
    const { search, type, course, minRating, maxFees, minFees, area, page = 1, limit = 20, sort = 'rating' } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { courses: { $regex: search, $options: 'i' } }
      ];
    }

    if (type) query.type = type;
    if (area) query.area = { $regex: area, $options: 'i' };
    if (minRating) query.rating = { $gte: parseFloat(minRating) };
    if (maxFees) query['fees.max'] = { $lte: parseInt(maxFees) };
    if (minFees) query['fees.min'] = { $gte: parseInt(minFees) };
    if (course) query.courses = { $regex: course, $options: 'i' };

    let sortObj = {};
    if (sort === 'rating') sortObj = { rating: -1 };
    else if (sort === 'fees_low') sortObj = { 'fees.min': 1 };
    else if (sort === 'fees_high') sortObj = { 'fees.min': -1 };
    else if (sort === 'placement') sortObj = { 'placement.percentage': -1 };
    else if (sort === 'ranking') sortObj = { 'ranking.nirf': 1 };

    const colleges = await College.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await College.countDocuments(query);

    res.json({
      success: true,
      colleges,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/colleges/top - Get top colleges
router.get('/top', async (req, res) => {
  try {
    const colleges = await College.find().sort({ rating: -1 }).limit(6);
    res.json({ success: true, colleges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/colleges/stats - Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const total = await College.countDocuments();
    const byType = await College.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const avgRating = await College.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);
    const topPlacement = await College.find()
      .sort({ 'placement.percentage': -1 })
      .limit(5)
      .select('name placement rating');

    res.json({
      success: true,
      stats: {
        total,
        byType,
        avgRating: avgRating[0]?.avg?.toFixed(1) || 0,
        topPlacement
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/colleges/nearby - Get nearby colleges
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng required' });

    const colleges = await College.find();
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    // Calculate distance using Haversine formula
    const withDistance = colleges.map(college => {
      const R = 6371;
      const dLat = (college.lat - userLat) * Math.PI / 180;
      const dLon = (college.lng - userLng) * Math.PI / 180;
      const a = Math.sin(dLat/2) ** 2 + Math.cos(userLat * Math.PI/180) * Math.cos(college.lat * Math.PI/180) * Math.sin(dLon/2) ** 2;
      const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return { ...college.toObject(), distance: Math.round(distance * 10) / 10 };
    });

    const nearby = withDistance
      .filter(c => c.distance <= parseFloat(radius))
      .sort((a, b) => a.distance - b.distance);

    res.json({ success: true, colleges: nearby });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/colleges/compare - Compare colleges
router.get('/compare', async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.status(400).json({ message: 'ids required' });
    const idArray = ids.split(',').slice(0, 4); // max 4
    const colleges = await College.find({ _id: { $in: idArray } });
    res.json({ success: true, colleges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/colleges/recommend - AI recommendations
router.get('/recommend', protect, async (req, res) => {
  try {
    const { budget, course, area } = req.query;
    let query = {};
    if (budget) query['fees.max'] = { $lte: parseInt(budget) };
    if (course) query.courses = { $regex: course, $options: 'i' };
    if (area) query.area = { $regex: area, $options: 'i' };
    const colleges = await College.find(query).sort({ rating: -1 }).limit(5);
    res.json({ success: true, colleges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/colleges/:id - Get single college
router.get('/:id', async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ success: false, message: 'College not found' });
    res.json({ success: true, college });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
