import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: String,
        image: String,
        price: Number, 
        qty: { type: Number, required: true, min: 1 },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    paymentMethod: { type: String, enum: ['COD', 'RAZORPAY'], default: 'COD' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paymentResult: { razorpayOrderId: String, razorpayPaymentId: String },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
