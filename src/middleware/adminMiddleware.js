const Usuario = require("../models/usuarioModel");

module.exports = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado." });
    }

    const usuario = await Usuario.getProfileById(userId);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (usuario.rol !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    req.user.rol = usuario.rol;
    next();
  } catch (error) {
    console.error("Error en adminMiddleware:", error);
    return res.status(500).json({ message: "Error al validar permisos de administrador." });
  }
};
