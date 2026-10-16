import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';

const img = (seed) => `https://picsum.photos/seed/${seed}/700/700`;

const products = [
  ['Wireless Headphones', 'Over-ear Bluetooth headphones with 30 hour battery life and soft memory-foam cushions.', 2499, 'Electronics', 25, true],
  ['Mechanical Keyboard', 'Compact 75% keyboard with hot-swappable switches and a metal top plate.', 3999, 'Electronics', 14, true],
  ['Smart Watch', 'Fitness tracking, heart-rate sensor and a week of battery on a single charge.', 3299, 'Electronics', 30, false],
  ['Portable Speaker', 'Splash-proof speaker with deep bass and 12 hours of playtime.', 1799, 'Electronics', 40, false],
  ['Running Shoes', 'Lightweight mesh running shoes with a cushioned, grippy sole.', 2799, 'Fashion', 50, true],
  ['Denim Jacket', 'Classic mid-wash denim jacket with a relaxed fit.', 1999, 'Fashion', 18, false],
  ['Canvas Backpack', 'Water-resistant 24L backpack with a padded laptop sleeve.', 1299, 'Fashion', 60, true],
  ['Sunglasses', 'Polarised UV400 sunglasses with a lightweight frame.', 799, 'Fashion', 3, false],
  ['Ceramic Mug Set', 'Set of four hand-glazed 300ml mugs, dishwasher safe.', 899, 'Home', 35, false],
  ['Desk Lamp', 'Dimmable LED lamp with three colour temperatures and a USB port.', 1199, 'Home', 22, true],
  ['Cotton Bedsheet', 'Double bedsheet, 300 thread count cotton, with two pillow covers.', 1499, 'Home', 0, false],
  ['Yoga Mat', 'Non-slip 6mm yoga mat with a carry strap.', 699, 'Sports', 45, false],
  ['Steel Water Bottle', 'Insulated 750ml bottle that keeps drinks cold for 24 hours.', 599, 'Sports', 80, false],
  ['Adjustable Dumbbells', 'Pair of adjustable dumbbells, 2 to 20 kg each.', 4499, 'Sports', 9, false],
].map(([name, description, price, category, stock, featured], i) => ({
  name, description, price, category, stock, featured,
  images: [img(`shop${i}a`), img(`shop${i}b`), img(`shop${i}c`)],
}));

await mongoose.connect(process.env.MONGO_URI);
await Promise.all([User.deleteMany(), Product.deleteMany(), Order.deleteMany(), Review.deleteMany()]);

await User.create([
  { name: 'Admin', email: 'admin@shopsphere.com', password: 'admin123', role: 'admin' },
  { name: 'Demo User', email: 'user@shopsphere.com', password: 'user123', role: 'user' },
]);
await Product.insertMany(products);

console.log('Seeded. Admin: admin@shopsphere.com / admin123  |  User: user@shopsphere.com / user123');
await mongoose.disconnect();
