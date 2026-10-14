const router = require('express').Router();
const c = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', c.getCart);
router.post('/', c.addToCart);
router.put('/:id', c.updateLine);
router.delete('/:id', c.removeLine);
router.delete('/', c.clear);

module.exports = router;
