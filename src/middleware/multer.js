const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadDir = path.resolve(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Límite de 5MB
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes o PDFs
    const tiposPermitidos = /jpeg|jpg|png|pdf/;
    const mimetype = tiposPermitidos.test(file.mimetype);
    const extname = tiposPermitidos.test(
      path.extname(file.originalname).toLowerCase(),
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Error: El archivo debe ser una imagen (jpeg/png) o un PDF"));
  },
});

module.exports = upload;
