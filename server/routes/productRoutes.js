const router = require('express').Router();
const c = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', c.list);
router.get('/:id', c.get);
router.post('/', protect, adminOnly, c.create);
router.put('/:id', protect, adminOnly, c.update);
router.delete('/:id', protect, adminOnly, c.remove);
router.post('/:id/reviews', protect, c.addReview);

module.exports = router;
