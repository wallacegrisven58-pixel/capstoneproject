const router = require('express').Router();
const c = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/settings', c.getSettings); // public
router.put('/settings', protect, adminOnly, c.updateSettings);
router.get('/stats', protect, adminOnly, c.stats);

module.exports = router;
