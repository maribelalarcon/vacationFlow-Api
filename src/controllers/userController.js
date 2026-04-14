const db = require("../db");

// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, nombre, apellidos, email, telefono, rol, created_at FROM users"
    );

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
      "SELECT id, nombre, apellidos, email, telefono, rol, created_at FROM users WHERE id = ?",
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "Usuario no localizado" });
    }

    res.json(users[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Obtener perfil del usuario registrado
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await db.query(
      "SELECT id, nombre, apellidos, email, telefono, rol FROM users WHERE id = ?",
      [userId]
    );

    res.json(users[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al localizar el usuario" });
  }
};

// Actualizar perfil
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nombre, apellidos, telefono } = req.body;

    await db.query(
      "UPDATE users SET nombre = ?, apellidos = ?, telefono = ? WHERE id = ?",
      [nombre, apellidos, telefono, userId]
    );

    res.json({ message: "Perfil actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar perfil" });
  }
};