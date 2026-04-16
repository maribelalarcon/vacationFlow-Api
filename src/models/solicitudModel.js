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

  getResumenCalendario: async (fecha_inicio, fecha_fin, usuario_id) => {
    const query = `
      SELECT
        COUNT(*) AS ausencias_en_mes,
        COALESCE(SUM(
          CASE
            WHEN s.usuario_id = ? AND s.tipo = 'vacaciones'
            THEN DATEDIFF(LEAST(s.fecha_fin, ?), GREATEST(s.fecha_inicio, ?)) + 1
            ELSE 0
          END
        ), 0) AS dias_propios_en_mes
      FROM solicitudes s
      WHERE s.estado IN ('pendiente', 'aprobado')
        AND s.fecha_inicio <= ?
        AND s.fecha_fin >= ?
    `;
    const [rows] = await db.query(query, [
      usuario_id,
      fecha_fin,
      fecha_inicio,
      fecha_fin,
      fecha_inicio,
    ]);
    return {
      ausencias_en_mes: Number(rows[0]?.ausencias_en_mes || 0),
      dias_propios_en_mes: Number(rows[0]?.dias_propios_en_mes || 0),
    };
  },

  getEventosCalendario: async (fecha_inicio, fecha_fin, usuario_id) => {
    const query = `
      SELECT
        s.id,
        s.usuario_id,
        u.nombre,
        u.apellido AS apellidos,
        s.tipo,
        s.estado,
        s.fecha_inicio,
        s.fecha_fin,
        s.comentario,
        s.justificante_ref,
        CASE
          WHEN s.usuario_id = ? THEN TRUE
          ELSE FALSE
        END AS es_propia
      FROM solicitudes s
      INNER JOIN usuarios u ON u.id = s.usuario_id
      WHERE s.estado IN ('pendiente', 'aprobado')
        AND s.fecha_inicio <= ?
        AND s.fecha_fin >= ?
      ORDER BY s.fecha_inicio, s.fecha_fin, u.nombre
    `;
    const [rows] = await db.query(query, [usuario_id, fecha_fin, fecha_inicio]);
    return rows.map((row) => ({
      ...row,
      es_propia: Boolean(row.es_propia),
    }));
  },

  getQuienesEstanFuera: async (fecha_inicio, fecha_fin) => {
    const query = `
      SELECT
        s.id,
        s.usuario_id,
        u.nombre,
        u.apellido AS apellidos,
        s.tipo,
        s.estado,
        s.fecha_inicio,
        s.fecha_fin
      FROM solicitudes s
      INNER JOIN usuarios u ON u.id = s.usuario_id
      WHERE s.estado IN ('pendiente', 'aprobado')
        AND s.fecha_inicio <= ?
        AND s.fecha_fin >= ?
      ORDER BY s.fecha_inicio, u.nombre
    `;
    const [rows] = await db.query(query, [fecha_fin, fecha_inicio]);
    return rows;
  },
};

module.exports = Solicitud;
