const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "secret123";

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No se ha proporcionado ningún token." });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, SECRET);

    req.user = decoded; // Guardamos la información del usuario autenticado.

    next();
  } catch (error) {
    return res.status(401).json({ message: "El token no es válido." });
  }
};
