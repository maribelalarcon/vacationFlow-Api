const db = require("../db");

const Solicitud = {
  create: async (datos) => {
    const { usuario_id, tipo, fecha_inicio, fecha_fin, comentario } = datos;
    const query = `
      INSERT INTO solicitudes 
      (usuario_id, tipo, fecha_inicio, fecha_fin, comentario) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [
      usuario_id,
      tipo,
      fecha_inicio,
      fecha_fin,
      comentario,
    ]);
    return result;
  },
};

module.exports = Solicitud;
