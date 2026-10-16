import Review from '../models/Review.js';
import Order from '../models/Order.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.id })
    .populate('user', 'name')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

// Only customers who actually bought the product can review it
export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const bought = await Order.exists({ user: req.user._id, 'items.product': req.params.id });
  if (!bought) {
    res.status(403);
    throw new Error('Only customers who purchased this product can review it');
  }
  const review = await Review.findOneAndUpdate(
    { user: req.user._id, product: req.params.id },
    { rating, comment },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
  await Review.recalc(req.params.id);
  res.status(201).json(review);
});
