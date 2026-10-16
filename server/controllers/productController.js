import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// GET /api/products?search=&category=&minPrice=&maxPrice=&rating=&sort=&page=&limit=&featured=
export const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    rating,
    sort = "newest",
    featured,
  } = req.query;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 12, 50);

  const filter = {};
  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (rating) filter.rating = { $gte: Number(rating) };
  if (featured === "true") filter.featured = true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ products, page, pages: Math.ceil(total / limit), total });
});

export const getCategories = asyncHandler(async (req, res) => {
  res.json(await Product.distinct("category"));
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock, images, featured } =
    req.body;
  const product = await Product.create({
    name,
    description,
    price,
    category,
    stock,
    images,
    featured,
  });
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock, images, featured } =
    req.body;
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { name, description, price, category, stock, images, featured },
    { new: true, runValidators: true },
  );
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ message: "Product deleted" });
});

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No image uploaded");
  }
  if (!process.env.CLOUDINARY_URL) {
    res.status(400);
    throw new Error(
      "Cloudinary is not configured. Paste an image URL instead.",
    );
  }
  const url = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "shopsphere" },
      (err, result) => (err ? reject(err) : resolve(result.secure_url)),
    );
    stream.end(req.file.buffer);
  });
  res.json({ url });
});
