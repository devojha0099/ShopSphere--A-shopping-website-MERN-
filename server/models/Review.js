import mongoose from 'mongoose';
import Product from './Product.js';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

//one user can review only one time
reviewSchema.index({ user: 1, product: 1 }, { unique: true });


// Average Rating
reviewSchema.statics.recalc = async function (productId) {
  const reviews = await this.find({ product: productId });

  let totalRating = 0;

  reviews.forEach((review) => {
    totalRating += review.rating;
  });

  const averageRating =
    reviews.length > 0
      ? Math.round((totalRating / reviews.length) * 10) / 10
      : 0;

  await Product.findByIdAndUpdate(productId, {
    rating: averageRating,
    numReviews: reviews.length,
  });
};


export default mongoose.model('Review', reviewSchema);
