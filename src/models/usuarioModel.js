const db = require("../db");

const Usuario = {
  findById: async (usuario_id) => {
    const query = `
      SELECT id, dias_vacaciones_totales
      FROM usuarios
      WHERE id = ?
      LIMIT 1
    `;
    const [rows] = await db.query(query, [usuario_id]);
    return rows[0] || null;
  },

  findByEmail: async (email) => {
    const query = `
      SELECT id, nombre, apellido, email, password_hash, rol, created_at
      FROM usuarios
      WHERE email = ?
      LIMIT 1
    `;
    const [rows] = await db.query(query, [email]);
    return rows[0] || null;
  },

  create: async ({ nombre, apellido, email, password_hash }) => {
    const query = `
      INSERT INTO usuarios (nombre, apellido, email, password_hash)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [
      nombre,
      apellido,
      email,
      password_hash,
    ]);
    return result;
  },

  getAll: async () => {
    const query = `
      SELECT
        id,
        nombre,
        apellido AS apellidos,
        NULL AS telefono,
        email,
        rol,
        created_at
      FROM usuarios
    `;
    const [rows] = await db.query(query);
    return rows;
  },

  getById: async (id) => {
    const query = `
      SELECT
        id,
        nombre,
        apellido AS apellidos,
        NULL AS telefono,
        email,
        rol,
        created_at
      FROM usuarios
      WHERE id = ?
      LIMIT 1
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0] || null;
  },

  getProfileById: async (id) => {
    const query = `
      SELECT
        id,
        nombre,
        apellido AS apellidos,
        NULL AS telefono,
        email,
        rol
      FROM usuarios
      WHERE id = ?
      LIMIT 1
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0] || null;
  },

  updateProfileById: async (id, { nombre, apellido }) => {
    const query = `
      UPDATE usuarios
      SET nombre = ?, apellido = ?
      WHERE id = ?
    `;
    const [result] = await db.query(query, [nombre, apellido, id]);
    return result;
  },
};

module.exports = Usuario;
