
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const FREE_SHIPPING_ABOVE = 999;
const SHIPPING_FEE = 49;

// POST /api/orders   body: { items: [{ product, qty }], shippingAddress, paymentMethod }
// Prices are ALWAYS read from the database, never trusted from the client.
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod = 'COD' } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Your cart is empty');
  }

  const deducted = []; // remember what we took, so we can roll back on failure
  const orderItems = [];
  try {
    for (const { product: id, qty } of items) {
      //  only decrement if enough stock is left (prevents overselling)
      const product = await Product.findOneAndUpdate(
        { _id: id, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { new: true }
      );
      if (!product) throw new Error('One or more items are out of stock or unavailable');
      deducted.push({ id, qty });
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0],
        price: product.price,
        qty,
      });
    }
  } catch (err) {
    await Promise.all(deducted.map((d) => Product.findByIdAndUpdate(d.id, { $inc: { stock: d.qty } })));
    res.status(400);
    throw err;
  }

  const itemsPrice = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shippingPrice = itemsPrice >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    total: itemsPrice + shippingPrice,
  });
  res.status(201).json(order);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  // Resource-level authorization: owner or admin only
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not allowed to view this order');
  }
  res.json(order);
});



// ---------- Admin ----------
export const getAllOrders = asyncHandler(async (req, res) => {
  res.json(await Order.find().populate('user', 'name email').sort({ createdAt: -1 }));
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  // Cancelling returns the stock (only once)
  if (orderStatus === 'Cancelled' && order.orderStatus !== 'Cancelled') {
    await Promise.all(order.items.map((i) => Product.findByIdAndUpdate(i.product, { $inc: { stock: i.qty } })));
  }
  order.orderStatus = orderStatus;
  if (orderStatus === 'Delivered' && order.paymentMethod === 'COD') order.paymentStatus = 'paid';
  await order.save();
  res.json(order);
});
