const express = require("express");
const router = express.Router();
const solicitudController = require("../controllers/solicitudController");

router.get("/disponible", solicitudController.obtenerDisponibilidad);

module.exports = router;
