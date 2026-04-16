const express = require("express");
const calendarioController = require("../controllers/calendarioController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, calendarioController.getCalendarioMensual);
router.get("/quienes-fuera", authMiddleware, calendarioController.getQuienesFuera);

module.exports = router;
