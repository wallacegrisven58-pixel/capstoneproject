const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { asyncHandler, httpError } = require('../middleware/error');

// Returns the user's cart lines with the current product data attached.
const loadCart = async (userId) => {
  const lines = await Cart.find({ userId }).populate('productId').sort({ createdAt: 1 });
  const clean = [];
  for (const l of lines) {
    if (!l.productId) {
      await l.deleteOne(); // product was deleted by the seller
      continue;
    }
    clean.push({ _id: l._id, quantity: l.quantity, size: l.size, product: l.productId });
  }
  return clean;
};

exports.getCart = asyncHandler(async (req, res) => {
  res.json(await loadCart(req.user._id));
});

exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, size } = req.body;
  const product = await Product.findById(productId);
  if (!product) throw httpError(404, 'Product not found');
  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  const useSize = size || product.sizes[0] || 'One size';
  const line = await Cart.findOne({ userId: req.user._id, productId, size: useSize });
  const next = (line ? line.quantity : 0) + qty;
  if (next > product.stock) throw httpError(400, `Only ${product.stock} in stock`);
  if (line) {
    line.quantity = next;
    await line.save();
  } else {
    await Cart.create({ userId: req.user._id, productId, quantity: qty, size: useSize });
  }
  res.status(201).json(await loadCart(req.user._id));
});

exports.updateLine = asyncHandler(async (req, res) => {
  const line = await Cart.findOne({ _id: req.params.id, userId: req.user._id }).populate('productId');
  if (!line) throw httpError(404, 'Cart item not found');
  const qty = Math.max(1, parseInt(req.body.quantity, 10) || 1);
  if (line.productId && qty > line.productId.stock) throw httpError(400, `Only ${line.productId.stock} in stock`);
  line.quantity = qty;
  await line.save();
  res.json(await loadCart(req.user._id));
});

exports.removeLine = asyncHandler(async (req, res) => {
  await Cart.deleteOne({ _id: req.params.id, userId: req.user._id });
  res.json(await loadCart(req.user._id));
});

exports.clear = asyncHandler(async (req, res) => {
  await Cart.deleteMany({ userId: req.user._id });
  res.json([]);
});
