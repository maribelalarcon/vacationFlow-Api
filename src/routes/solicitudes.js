const express = require("express");
const multer = require("multer");
const router = express.Router();
const solicitudController = require("../controllers/solicitudController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");

router.post(
  "/subir-justificante",
  authMiddleware,
  (req, res, next) => {
    upload.single("justificante")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Error de Multer
        return res
          .status(400)
          .json({ message: "Error de subida: " + err.message });
      } else if (err) {
        // Error de nuestro filtro
        return res.status(400).json({ message: err.message });
      }

      next();
    });
  },
  solicitudController.subirJustificante,
);

router.post("/", authMiddleware, solicitudController.crearSolicitud);

module.exports = router;
