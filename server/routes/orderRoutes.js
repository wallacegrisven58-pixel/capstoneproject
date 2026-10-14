const router = require('express').Router();
const c = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.post('/', c.create);
router.get('/mine', c.mine);
router.get('/', adminOnly, c.all);
router.get('/:id', c.getOne);
router.put('/:id/status', adminOnly, c.updateStatus);

module.exports = router;
