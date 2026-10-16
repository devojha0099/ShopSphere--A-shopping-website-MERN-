import { Router } from 'express';
import { body } from 'express-validator';
import {
  createOrder, getMyOrders, getOrder,  getAllOrders, updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(protect);

router.post(
  '/',
  [
    body('items').isArray({ min: 1 }).withMessage('Cart is empty'),
    body('items.*.qty').isInt({ min: 1 }).withMessage('Invalid quantity'),
    body('shippingAddress.fullName').trim().notEmpty().withMessage('Full name is required'),
    body('shippingAddress.phone').trim().notEmpty().withMessage('Phone is required'),
    body('shippingAddress.address').trim().notEmpty().withMessage('Address is required'),
    body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
    body('shippingAddress.postalCode').trim().notEmpty().withMessage('Postal code is required'),
  ],
  validate,
  createOrder
);
router.get('/mine', getMyOrders);
router.get('/', adminOnly, getAllOrders);
router.get('/:id', getOrder);
router.put('/:id/status', adminOnly, body('orderStatus').isIn(['Pending', 'Shipped', 'Delivered', 'Cancelled']), validate, updateOrderStatus);

export default router;
