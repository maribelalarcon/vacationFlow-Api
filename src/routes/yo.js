const express = require("express");
const router = express.Router();
const solicitudController = require("../controllers/solicitudController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/disponible", authMiddleware, solicitudController.obtenerDisponibilidad);

module.exports = router;
