const db = require("../db");

// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.query("SELECT id, email, created_at FROM users");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en servidor" });
  }
};

// Obtener usuario por ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.query(
      "SELECT id, email, created_at FROM users WHERE id = ?",
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(users[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en servidor" });
  }
};