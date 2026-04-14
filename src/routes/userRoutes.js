const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// Obtener usuarios por perfil y modificar dicho perfil
router.get("/profile", authMiddleware, userController.getProfile);
router.put("/profile", authMiddleware, userController.updateProfile);

// Obtener todos los usuarios y obtener usuarios por ID
router.get("/", authMiddleware, userController.getUsers);
router.get("/:id", authMiddleware, userController.getUserById);

module.exports = router;