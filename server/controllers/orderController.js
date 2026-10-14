const Orders = require('../models/Orders');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { asyncHandler, httpError } = require('../middleware/error');

const round2 = (n) => Math.round(n * 100) / 100;
const FREE_SHIPPING_FROM = 75;
const SHIPPING_FEE = 6;

// POST /api/orders
// body: { items:[{productId,quantity,size}], fromCart:Boolean, shipping:{...}, paymentMethod, notes }
// Prices are always recalculated here, never trusted from the client.
exports.create = asyncHandler(async (req, res) => {
  const { shipping = {}, paymentMethod = 'cod', notes = '', fromCart } = req.body;
  let wanted = req.body.items || [];

  if (fromCart) {
    const lines = await Cart.find({ userId: req.user._id });
    wanted = lines.map((l) => ({ productId: l.productId, quantity: l.quantity, size: l.size }));
  }
  if (!wanted.length) throw httpError(400, 'There is nothing to order');

  const items = [];
  const bought = [];
  for (const w of wanted) {
    const p = await Product.findById(w.productId);
    if (!p) throw httpError(400, 'One of the products no longer exists');
    const qty = Math.max(1, parseInt(w.quantity, 10) || 1);
    if (p.stock < qty) throw httpError(400, `${p.title} only has ${p.stock} left`);
    items.push({
      productId: p._id,
      name: p.title,
      category: p.category,
      image: p.image,
      hue: p.hue,
      price: p.finalPrice,
      quantity: qty,
      size: w.size || p.sizes[0] || 'One size',
    });
    bought.push({ p, qty });
  }

  const subtotal = round2(items.reduce((a, i) => a + i.price * i.quantity, 0));
  const shippingFee = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;

  const order = await Orders.create({
    userId: req.user._id,
    customerName: req.user.username,
    customerEmail: req.user.email,
    items,
    shipping: {
      name: shipping.name,
      mobile: shipping.mobile,
      address: shipping.address,
      city: shipping.city,
      pincode: shipping.pincode,
    },
    paymentMethod,
    notes,
    subtotal,
    shippingFee,
    total: round2(subtotal + shippingFee),
  });

  for (const { p, qty } of bought) {
    p.stock -= qty;
    await p.save();
  }
  if (fromCart) await Cart.deleteMany({ userId: req.user._id });

  res.status(201).json(order);
});

exports.mine = asyncHandler(async (req, res) => {
  res.json(await Orders.find({ userId: req.user._id }).sort({ createdAt: -1 }));
});

exports.getOne = asyncHandler(async (req, res) => {
  const order = await Orders.findById(req.params.id);
  if (!order) throw httpError(404, 'Order not found');
  if (String(order.userId) !== String(req.user._id) && req.user.role !== 'admin') {
    throw httpError(403, 'This is not your order');
  }
  res.json(order);
});

// Admin
exports.all = asyncHandler(async (req, res) => {
  const filter = req.query.status && req.query.status !== 'All' ? { status: req.query.status } : {};
  res.json(await Orders.find(filter).sort({ createdAt: -1 }));
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!Orders.STATUS.includes(status)) throw httpError(400, 'Unknown status');
  const order = await Orders.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) throw httpError(404, 'Order not found');
  res.json(order);
});
