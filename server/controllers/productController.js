const Product = require('../models/Product');
const { asyncHandler, httpError } = require('../middleware/error');

const pick = (b) => {
  const out = {};
  ['title', 'description', 'category', 'price', 'discount', 'stock', 'sizes', 'image', 'hue'].forEach((k) => {
    if (b[k] !== undefined) out[k] = b[k];
  });
  if (typeof out.sizes === 'string') out.sizes = out.sizes.split(',').map((s) => s.trim()).filter(Boolean);
  if (out.sizes && !out.sizes.length) out.sizes = ['One size'];
  return out;
};

// GET /api/products?category=&q=&maxPrice=&sort=
exports.list = asyncHandler(async (req, res) => {
  const { category, q, maxPrice, sort } = req.query;
  const filter = {};
  if (category && category !== 'All') filter.category = category;
  if (q) {
    const rx = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: rx }, { description: rx }, { category: rx }];
  }
  let products = await Product.find(filter).sort({ createdAt: 1 });
  if (maxPrice) products = products.filter((p) => p.finalPrice <= Number(maxPrice));
  const sorters = {
    low: (a, b) => a.finalPrice - b.finalPrice,
    high: (a, b) => b.finalPrice - a.finalPrice,
    rating: (a, b) => b.rating - a.rating,
    discount: (a, b) => b.discount - a.discount,
  };
  if (sorters[sort]) products.sort(sorters[sort]);
  res.json(products);
});

exports.get = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) throw httpError(404, 'Product not found');
  res.json(p);
});

exports.create = asyncHandler(async (req, res) => {
  const p = await Product.create(pick(req.body));
  res.status(201).json(p);
});

exports.update = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) throw httpError(404, 'Product not found');
  Object.assign(p, pick(req.body));
  await p.save();
  res.json(p);
});

exports.remove = asyncHandler(async (req, res) => {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) throw httpError(404, 'Product not found');
  res.json({ message: 'Product deleted' });
});

exports.addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const p = await Product.findById(req.params.id);
  if (!p) throw httpError(404, 'Product not found');
  p.reviews.push({
    user: req.user._id,
    name: req.user.username.split(' ')[0],
    rating: Number(rating),
    comment: String(comment || '').trim(),
  });
  await p.save();
  res.status(201).json(p);
});
