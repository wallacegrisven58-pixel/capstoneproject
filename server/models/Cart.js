const mongoose = require('mongoose');

// One document per cart line. Lines are told apart by userId.
const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    size: { type: String, default: 'One size' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
