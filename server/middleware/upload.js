import multer from 'multer';

// Keep the file in memory, then stream it to Cloudinary
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Only images are allowed')),
});
