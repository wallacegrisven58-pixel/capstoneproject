// Fills an empty database with an admin account, sample products and the storefront settings.
// Run once:  npm run seed      (this wipes users, products, carts, orders and settings first)
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Orders = require('./models/Orders');
const Admin = require('./models/Admin');

const products = [
  ['Solstice Gold Bangle', 'Bracelets', 68, 0, 42, 12, ['S', 'M', 'L'], 'A polished gold-tone bangle with a soft open back, easy to slip on and stack.'],
  ['Tidepool Beaded Bracelet', 'Bracelets', 24, 15, 190, 40, ['S', 'M', 'L'], 'Hand-strung glass beads in sea-glass blues on stretch cord.'],
  ['Thread & Charm Bracelet', 'Bracelets', 32, 0, 340, 25, ['One size'], 'Braided cord with three tiny charms and an adjustable slider clasp.'],
  ['Linked Silver Cuff', 'Bracelets', 54, 10, 215, 8, ['S', 'M', 'L'], 'A chunky chain-link cuff in brushed silver tone.'],
  ['Marlow Crossbody', 'Bags', 89, 20, 20, 15, ['One size'], 'Vegan leather crossbody with a zip top and an adjustable strap.'],
  ['Daybreak Mini Tote', 'Bags', 74, 0, 150, 10, ['One size'], 'A structured mini tote that holds a phone, keys and a small notebook.'],
  ['Quilted Evening Clutch', 'Bags', 59, 10, 285, 6, ['One size'], 'Quilted clutch with a detachable chain strap for evenings out.'],
  ['Halo Hoop Earrings', 'Earrings', 38, 0, 45, 30, ['One size'], 'Lightweight gold-tone hoops with a slim inner halo.'],
  ['Drop Pearl Studs', 'Earrings', 29, 0, 330, 22, ['One size'], 'Freshwater-style pearl drops on hypoallergenic posts.'],
  ['Terra Dangle Earrings', 'Earrings', 26, 25, 15, 18, ['One size'], 'Clay-toned dangles with a hand-painted finish.'],
  ['Meridian Steel Watch', 'Watches', 149, 15, 205, 9, ['One size'], 'Stainless steel case, sapphire-style glass, 5 ATM water resistance.'],
  ['Slim Rose Watch', 'Watches', 119, 0, 10, 7, ['One size'], 'A 32 mm dress watch with a rose-gold tone case and a mesh strap.'],
  ['Coastline Round Shades', 'Sunglasses', 46, 0, 35, 20, ['One size'], 'Round acetate frames with UV400 lenses.'],
  ['Aviator Lite', 'Sunglasses', 52, 10, 200, 14, ['One size'], 'A featherweight metal aviator with polarised lenses.'],
  ['Silk Garden Scarf', 'Scarves', 41, 0, 120, 16, ['One size'], 'A printed silk-feel scarf, 90 x 90 cm, for the neck, hair or bag handle.'],
  ['Merino Wrap', 'Scarves', 63, 0, 260, 5, ['One size'], 'A soft merino blend wrap, generous enough to use as a shawl.'],
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shopez');
  await Promise.all([User.deleteMany(), Product.deleteMany(), Cart.deleteMany(), Orders.deleteMany(), Admin.deleteMany()]);

  await User.create({
    username: 'ShopEZ Seller',
    email: 'admin@shopez.demo',
    password: await bcrypt.hash('admin123', 10),
    role: 'admin',
  });
  await Product.insertMany(
    products.map(([title, category, price, discount, hue, stock, sizes, description]) => ({
      title, category, price, discount, hue, stock, sizes, description,
    }))
  );
  await Admin.create({});

  console.log('Seeded: 1 admin (admin@shopez.demo / admin123), ' + products.length + ' products, storefront settings.');
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
