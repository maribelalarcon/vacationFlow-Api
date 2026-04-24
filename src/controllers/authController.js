const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuarioModel");

const SECRET = process.env.JWT_SECRET || "secret123";
const ROLES_VALIDOS = ["usuario", "admin"];

const register = async (req, res) => {
  try {
    const { nombre, apellido, apellidos, email, password, rol } = req.body;
    const apellidoNormalizado = apellido || apellidos;
    const rolNormalizado = typeof rol === "string" ? rol.trim().toLowerCase() : "";

    if (!nombre || !apellidoNormalizado || !email || !password || !rolNormalizado) {
      return res.status(400).json({ message: "Completa todos los campos obligatorios." });
    }

    if (!ROLES_VALIDOS.includes(rolNormalizado)) {
      return res.status(400).json({ message: "El rol debe ser 'usuario' o 'admin'." });
    }

    const user = await Usuario.findByEmail(email);

    if (user) {
      return res.status(400).json({ message: "El usuario ya está registrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Usuario.create({
      nombre,
      apellido: apellidoNormalizado,
      email,
      password_hash: hashedPassword,
      rol: rolNormalizado,
    });

    res.status(201).json({
      message: "Usuario creado correctamente.",
      rol: rolNormalizado,
    });
  } catch (error) {
    console.error("Error en Controller:", error);
    res.status(500).json({ message: "Se produjo un error en el servidor." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Usuario.findByEmail(email);

    if (!user) {
      return res.status(400).json({ message: "Las credenciales no son correctas." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "Las credenciales no son correctas." });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        id: user.id,
        rol: user.rol,
      },
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      rol: user.rol,
      userId: user.id,
    });
  } catch (error) {
    console.error("Error en Controller:", error);
    res.status(500).json({ message: "Se produjo un error en el servidor." });
  }
};

module.exports = { register, login };
