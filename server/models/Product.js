const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    category: { type: String, required: [true, 'Category is required'], trim: true },
    price: { type: Number, required: [true, 'Price is required'], min: [0.5, 'Price must be above zero'] },
    discount: { type: Number, default: 0, min: 0, max: 90 }, // percent
    stock: { type: Number, default: 0, min: 0 },
    sizes: { type: [String], default: ['One size'] },
    image: { type: String, default: '' }, // URL or data URI. Empty = illustration on the client.
    hue: { type: Number, default: 200 }, // tile tint for the illustration
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

productSchema.virtual('finalPrice').get(function () {
  return Math.round(this.price * (1 - this.discount / 100) * 100) / 100;
});
productSchema.virtual('rating').get(function () {
  if (!this.reviews.length) return 0;
  return this.reviews.reduce((a, r) => a + r.rating, 0) / this.reviews.length;
});
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
