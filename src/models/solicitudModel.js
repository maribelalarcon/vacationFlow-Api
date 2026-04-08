const db = require("../db");

const Solicitud = {
  create: async (datos) => {
    const {
      usuario_id,
      tipo,
      fecha_inicio,
      fecha_fin,
      comentario,
      justificante_ref,
    } = datos;
    const query = `
      INSERT INTO solicitudes 
      (usuario_id, tipo, fecha_inicio, fecha_fin, comentario, justificante_ref) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [
      usuario_id,
      tipo,
      fecha_inicio,
      fecha_fin,
      comentario,
      justificante_ref,
    ]);
    return result;
  },

  getDisponibilidadByUsuario: async (usuario_id) => {
    const query = `
      SELECT
        u.id AS usuario_id,
        u.dias_vacaciones_totales,
        COALESCE(SUM(
          CASE
            WHEN s.tipo = 'vacaciones' AND s.estado = 'aprobado'
            THEN DATEDIFF(s.fecha_fin, s.fecha_inicio) + 1
            ELSE 0
          END
        ), 0) AS dias_consumidos,
        COALESCE(SUM(
          CASE
            WHEN s.tipo = 'vacaciones' AND s.estado = 'pendiente'
            THEN DATEDIFF(s.fecha_fin, s.fecha_inicio) + 1
            ELSE 0
          END
        ), 0) AS dias_pendientes
      FROM usuarios u
      LEFT JOIN solicitudes s ON s.usuario_id = u.id
      WHERE u.id = ?
      GROUP BY u.id, u.dias_vacaciones_totales
    `;
    const [rows] = await db.query(query, [usuario_id]);
    return rows[0] || null;
  },
};

module.exports = Solicitud;
