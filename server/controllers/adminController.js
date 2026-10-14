const Admin = require('../models/Admin');
const Orders = require('../models/Orders');
const Product = require('../models/Product');
const User = require('../models/User');
const { asyncHandler, httpError } = require('../middleware/error');

const getDoc = async () => (await Admin.findOne()) || (await Admin.create({}));

// Public: the storefront needs the banner and categories.
exports.getSettings = asyncHandler(async (req, res) => {
  res.json(await getDoc());
});

exports.updateSettings = asyncHandler(async (req, res) => {
  const doc = await getDoc();
  const { banner, categories } = req.body;
  if (banner) {
    ['headline', 'sub', 'image', 'hue'].forEach((k) => {
      if (banner[k] !== undefined) doc.set(`banner.${k}`, banner[k]);
    });
  }
  if (categories) {
    const clean = [...new Set(categories.map((c) => String(c).trim()).filter(Boolean))];
    const inUse = await Product.distinct('category');
    const missing = inUse.filter((c) => !clean.includes(c));
    if (missing.length) throw httpError(400, `Move or delete the products in: ${missing.join(', ')}`);
    doc.categories = clean;
  }
  await doc.save();
  res.json(doc);
});

exports.stats = asyncHandler(async (req, res) => {
  const [orders, products, customers] = await Promise.all([
    Orders.find(),
    Product.find(),
    User.countDocuments({ role: 'user' }),
  ]);
  const revenue = orders.reduce((a, o) => a + o.total, 0);
  const byCategory = {};
  orders.forEach((o) => o.items.forEach((i) => {
    byCategory[i.category] = (byCategory[i.category] || 0) + i.price * i.quantity;
  }));
  res.json({
    orders: orders.length,
    waiting: orders.filter((o) => o.status === 'Placed').length,
    revenue: Math.round(revenue * 100) / 100,
    products: products.length,
    customers,
    lowStock: products.filter((p) => p.stock <= 5).map((p) => ({ id: p._id, title: p.title, stock: p.stock })),
    byCategory,
  });
});
