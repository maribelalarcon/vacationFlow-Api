const Usuario = require("../models/usuarioModel");

const getUsers = async (req, res) => {
  try {
    const users = await Usuario.getAll();

    res.json(users);
  } catch (error) {
    console.error("Error en Controller:", error);
    res.status(500).json({ message: "Se produjo un error en el servidor." });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await Usuario.getById(id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.json(user);
  } catch (error) {
    console.error("Error en Controller:", error);
    res.status(500).json({ message: "Se produjo un error en el servidor." });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await Usuario.getProfileById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.json(user);
  } catch (error) {
    console.error("Error en Controller:", error);
    res.status(500).json({ message: "Se produjo un error al obtener el perfil." });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { nombre, apellido, apellidos } = req.body;
    const apellidoNormalizado = apellido || apellidos;

    if (!nombre || !apellidoNormalizado) {
      return res.status(400).json({ message: "El nombre y los apellidos son obligatorios." });
    }

    await Usuario.updateProfileById(userId, {
      nombre,
      apellido: apellidoNormalizado,
    });

    res.json({ message: "Perfil actualizado correctamente." });
  } catch (error) {
    console.error("Error en Controller:", error);
    res.status(500).json({ message: "Se produjo un error al actualizar el perfil." });
  }
};

module.exports = { getUsers, getUserById, getProfile, updateProfile };
