const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "secret123";

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No se ha proporcionado ningún token." });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "El formato del token no es válido." });
    }

    const decoded = jwt.verify(token, SECRET);

    req.user = {
      ...decoded,
      userId: decoded.userId || decoded.id,
      id: decoded.id || decoded.userId,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "El token no es válido." });
  }
};
