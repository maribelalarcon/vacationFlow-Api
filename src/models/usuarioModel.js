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
};

module.exports = Usuario;
