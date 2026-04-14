const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuarioModel");

const SECRET = process.env.JWT_SECRET || "secret123";

const register = async (req, res) => {
  try {
    const { nombre, apellido, apellidos, email, password } = req.body;
    const apellidoNormalizado = apellido || apellidos;

    if (!nombre || !apellidoNormalizado || !email || !password) {
      return res.status(400).json({ message: "Completa todos los campos obligatorios." });
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
    });

    res.status(201).json({ message: "Usuario creado correctamente." });
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
      { userId: user.id },
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Error en Controller:", error);
    res.status(500).json({ message: "Se produjo un error en el servidor." });
  }
};

module.exports = { register, login };
