import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getStats = asyncHandler(async (req, res) => {
  const validOrders = { orderStatus: { $ne: 'Cancelled' } };

  const [revenueAgg, orders, users, lowStock, recentOrders] = await Promise.all([
    Order.aggregate([{ $match: validOrders }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ stock: { $lte: 5 } }),
    Order.find().populate('user', 'name').sort({ createdAt: -1 }).limit(5),
  ]);

  // Sales per day, last 7 days
  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);
  const daily = await Order.aggregate([
    { $match: { ...validOrders, createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        sales: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
  ]);
  const byDay = Object.fromEntries(daily.map((d) => [d._id, d]));
  const salesByDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    return { date: key.slice(5), sales: byDay[key]?.sales || 0, orders: byDay[key]?.orders || 0 };
  });

  res.json({ revenue: revenueAgg[0]?.total || 0, orders, users, lowStock, salesByDay, recentOrders });
});
