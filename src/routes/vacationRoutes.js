const express = require("express");
const router = express.Router();

const vacationController = require("../controllers/vacationController");
const authMiddleware = require("../middleware/authMiddleware");

// Crear solicitud
router.post("/", authMiddleware, vacationController.createVacation);

module.exports = router;