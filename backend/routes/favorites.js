const express = require('express');
const router = express.Router();
const User = require('../models/User');
const College = require('../models/College');
const { protect } = require('../middleware/auth');

// @route GET /api/favorites - Get user favorites
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json({ success: true, favorites: user.favorites || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/favorites/:collegeId - Add to favorites
router.post('/:collegeId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.favorites.includes(req.params.collegeId)) {
      return res.status(400).json({ success: false, message: 'Already in favorites' });
    }
    user.favorites.push(req.params.collegeId);
    await user.save();
    res.json({ success: true, message: 'Added to favorites' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route DELETE /api/favorites/:collegeId - Remove from favorites
router.delete('/:collegeId', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { favorites: req.params.collegeId }
    });
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
