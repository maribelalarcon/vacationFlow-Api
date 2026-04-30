const Usuario = require("../models/usuarioModel");
const Solicitud = require("../models/solicitudModel");

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
    const { nombre, apellido, apellidos, email, avatar_url } = req.body;
    const apellidoNormalizado = apellido || apellidos;
    const emailNormalizado = typeof email === "string" ? email.trim().toLowerCase() : undefined;
    const tieneNombre = typeof nombre === "string" && nombre.trim() !== "";
    const tieneApellido = typeof apellidoNormalizado === "string" && apellidoNormalizado.trim() !== "";
    const tieneEmail = typeof emailNormalizado === "string" && emailNormalizado !== "";
    const tieneAvatar = typeof avatar_url === "string" || avatar_url === null;

    if (!tieneAvatar && (!tieneNombre || !tieneApellido || !tieneEmail)) {
      return res.status(400).json({
        message: "Debes enviar nombre, apellido y email, o bien una foto de perfil para actualizar.",
      });
    }

    if (tieneEmail) {
      const existingUser = await Usuario.findByEmail(emailNormalizado);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: "Ese email ya está en uso por otro usuario." });
      }
    }

    if (typeof avatar_url === "string" && avatar_url.length > 3_000_000) {
      return res.status(400).json({ message: "La foto de perfil es demasiado grande." });
    }

    await Usuario.updateProfileById(userId, {
      nombre: tieneNombre ? nombre.trim() : undefined,
      apellido: tieneApellido ? apellidoNormalizado.trim() : undefined,
      email: tieneEmail ? emailNormalizado : undefined,
      avatar_url,
    });

    const updatedUser = await Usuario.getProfileById(userId);

    res.json({
      message: "Perfil actualizado correctamente.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error en Controller:", error);
    res.status(500).json({ message: "Se produjo un error al actualizar el perfil." });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const userId = req.user.userId;
    const solicitudes = await Solicitud.getHistorialByUsuario(userId);
    res.json(solicitudes);
  } catch (error) {
    console.error("Error en Controller:", error);
    res.status(500).json({ message: "Se produjo un error al obtener el historial de solicitudes." });
  }
};

module.exports = { getUsers, getUserById, getProfile, updateProfile, getMyRequests };
