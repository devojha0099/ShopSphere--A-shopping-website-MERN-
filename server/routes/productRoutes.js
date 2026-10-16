import { Router } from 'express';
import { body } from 'express-validator';
import {
  getProducts, getCategories, getProduct, createProduct, updateProduct, deleteProduct, uploadImage,
} from '../controllers/productController.js';
import { getReviews, addReview } from '../controllers/reviewController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const productRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be 0 or more'),
];

router.get('/', getProducts);
router.get('/categories', getCategories);
router.post('/upload', protect, adminOnly, upload.single('image'), uploadImage);
router.post('/', protect, adminOnly, productRules, validate, createProduct);

router.get('/:id', getProduct);
router.put('/:id', protect, adminOnly, productRules, validate, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

router.get('/:id/reviews', getReviews);
router.post(
  '/:id/reviews',
  protect,
  [body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1 to 5'), body('comment').trim().notEmpty().withMessage('Comment is required')],
  validate,
  addReview
);

export default router;
