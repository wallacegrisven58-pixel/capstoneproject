const mongoose = require('mongoose');

const STATUS = ['Placed', 'Packed', 'Shipped', 'Delivered'];

const itemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    category: String,
    image: String,
    hue: Number,
    price: Number, // price per unit after discount, frozen at order time
    quantity: Number,
    size: String,
  },
  { _id: false }
);

const ordersSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerName: String,
    customerEmail: String,
    items: { type: [itemSchema], validate: (v) => v.length > 0 },
    shipping: {
      name: { type: String, required: true },
      mobile: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    paymentMethod: { type: String, enum: ['cod', 'card', 'bank', 'wallet'], default: 'cod' },
    notes: { type: String, default: '' },
    subtotal: Number,
    shippingFee: Number,
    total: Number,
    status: { type: String, enum: STATUS, default: 'Placed' },
  },
  { timestamps: true } // createdAt = order date
);

const Orders = mongoose.model('Orders', ordersSchema);
Orders.STATUS = STATUS;
module.exports = Orders;
