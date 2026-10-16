import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.json(user.wishlist);
});

// Add if missing, remove if present. Returns the fresh populated list.
export const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const id = req.params.productId;
  const exists = user.wishlist.some((p) => p.toString() === id);
  user.wishlist = exists ? user.wishlist.filter((p) => p.toString() !== id) : [...user.wishlist, id];
  await user.save();
  await user.populate('wishlist');
  res.json(user.wishlist);
});
