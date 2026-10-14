const mongoose = require('mongoose');

// Single settings document: home banner and the category list.
const adminSchema = new mongoose.Schema({
  banner: {
    headline: { type: String, default: 'Find the gift in three clicks.' },
    sub: { type: String, default: 'Bracelets, bags, earrings and more, with real reviews and a fast checkout.' },
    image: { type: String, default: '' },
    hue: { type: Number, default: 172 },
  },
  categories: { type: [String], default: ['Bracelets', 'Bags', 'Earrings', 'Watches', 'Sunglasses', 'Scarves'] },
});

module.exports = mongoose.model('Admin', adminSchema);
