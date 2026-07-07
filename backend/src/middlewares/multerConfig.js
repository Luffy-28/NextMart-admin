import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import path from "path";
import { config } from "../config/config.js";

// ─── S3 client ────────────────────────────────────────────────────────────────
const s3 = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKey,
    secretAccessKey: config.aws.secretKey,
  },
});

// ─── Security: allowed extensions (strict allowlist) ─────────────────────────
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg"]);

// ─── Security: allowed MIME types (allowlist) ────────────────────────────────
const ALLOWED_MIMETYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
]);



const fileFilter = (req, file, cb) => {
  // 1. Check extension (case-insensitive)
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(
      new Error(
        `File extension "${ext}" is not allowed. Allowed: ${[...ALLOWED_EXTENSIONS].join(", ")}`
      ),
      false
    );
  }

  // 2. Check MIME type
  if (!ALLOWED_MIMETYPES.has(file.mimetype)) {
    return cb(
      new Error(
        `MIME type "${file.mimetype}" is not allowed. Only image files are accepted.`
      ),
      false
    );
  }

  // 3. Guard against MIME ↔ extension mismatch (e.g. script.jpg with text/html)
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed."), false);
  }

  cb(null, true);
};
const buildStorage = (folder = "uploads") =>
  multerS3({
    s3,
    bucket: config.aws.bucketName,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.\-_]/g, "_");
      cb(null, `${folder}/${Date.now()}-${safeName}`);
    },
  });


export const uploadProductImages = multer({
  storage: buildStorage("products"),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter,
});

export const uploadCategoryImage = multer({
  storage: buildStorage("categories"),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter,
});

export const uploadSubCategoryImage = multer({
  storage: buildStorage("subcategories"),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter,
});

export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors (file too large, too many files, etc.)
    return res.status(400).json({ status: "error", message: err.message });
  }
  if (err) {
    // Our custom fileFilter errors (bad extension / MIME)
    return res.status(400).json({ status: "error", message: err.message });
  }
  next();
};