const db = require("../db");
const nodemailer = require("nodemailer");

const parsePeriodo = (query) => {
  const hoy = new Date();
  const anio = Number(query.anio || hoy.getUTCFullYear());
  const mes = Number(query.mes || hoy.getUTCMonth() + 1);

  if (!Number.isInteger(anio) || !Number.isInteger(mes) || mes < 1 || mes > 12) {
    return null;
  }

  const fechaInicio = new Date(Date.UTC(anio, mes - 1, 1));
  const fechaFin = new Date(Date.UTC(anio, mes, 0));

  return {
    anio,
    mes,
    fecha_inicio: fechaInicio.toISOString().slice(0, 10),
    fecha_fin: fechaFin.toISOString().slice(0, 10),
  };
};

const buildReferencia = (id, fechaInicio) => {
  const year = String(fechaInicio || "").slice(0, 4) || "0000";
  return `VAC-${year}-${String(id).padStart(4, "0")}`;
};

const mapSolicitudResumen = (row) => ({
  id: Number(row.id),
  referencia: buildReferencia(row.id, row.fecha_inicio),
  empleado: {
    id: Number(row.usuario_id),
    nombre: row.nombre,
    apellidos: row.apellidos,
    email: row.email,
  },
  tipo: row.tipo,
  estado: row.estado,
  fecha_inicio: row.fecha_inicio,
  fecha_fin: row.fecha_fin,
  total_dias: Number(row.total_dias),
  comentario: row.comentario,
  justificante_ref: row.justificante_ref,
});

const buildAdjuntos = (justificanteRef) => {
  if (!justificanteRef) {
    return [];
  }

  const nombre = justificanteRef.split("/").pop();
  return [
    {
      nombre,
      url: justificanteRef,
      tipo: "justificante",
    },
  ];
};

const getPendingVacations = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        s.id,
        s.usuario_id,
        u.nombre,
        u.apellido AS apellidos,
        u.email,
        s.tipo,
        s.estado,
        s.fecha_inicio,
        s.fecha_fin,
        s.comentario,
        s.justificante_ref,
        DATEDIFF(s.fecha_fin, s.fecha_inicio) + 1 AS total_dias
      FROM solicitudes s
      INNER JOIN usuarios u ON u.id = s.usuario_id
      WHERE s.estado = 'pendiente'
      ORDER BY s.fecha_inicio, s.id
    `);

    return res.json(rows.map(mapSolicitudResumen));
  } catch (error) {
    console.error("Error en getPendingVacations:", error);
    return res.status(500).json({ message: "Error al obtener solicitudes pendientes." });
  }
};

const updateSolicitudEstado = async (id, estado) => {
  const [result] = await db.query(
    `
      UPDATE solicitudes
      SET estado = ?
      WHERE id = ? AND estado = 'pendiente'
    `,
    [estado, id],
  );

  return result;
};

const approveVacation = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateSolicitudEstado(id, "aprobado");

    if (!result.affectedRows) {
      return res.status(404).json({ message: "La solicitud no existe o ya fue gestionada." });
    }

    return res.json({ message: "Solicitud aprobada correctamente." });
  } catch (error) {
    console.error("Error en approveVacation:", error);
    return res.status(500).json({ message: "Error al aprobar la solicitud." });
  }
};

const rejectVacation = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateSolicitudEstado(id, "rechazado");

    if (!result.affectedRows) {
      return res.status(404).json({ message: "La solicitud no existe o ya fue gestionada." });
    }

    return res.json({ message: "Solicitud rechazada correctamente." });
  } catch (error) {
    console.error("Error en rejectVacation:", error);
    return res.status(500).json({ message: "Error al rechazar la solicitud." });
  }
};

const getOccupationStats = async (req, res) => {
  try {
    const [totalUsuariosRows] = await db.query("SELECT COUNT(*) AS total FROM usuarios");
    const [rows] = await db.query(`
      SELECT
        MONTH(fecha_inicio) AS mes,
        COUNT(*) AS total_ausencias
      FROM solicitudes
      WHERE estado = 'aprobado'
      GROUP BY MONTH(fecha_inicio)
      ORDER BY mes
    `);

    return res.json({
      total_usuarios: Number(totalUsuariosRows[0]?.total || 0),
      ocupacion_mensual: rows.map((row) => ({
        mes: Number(row.mes),
        total_ausencias: Number(row.total_ausencias),
      })),
    });
  } catch (error) {
    console.error("Error en getOccupationStats:", error);
    return res.status(500).json({ message: "Error al obtener estadísticas de ocupación." });
  }
};

const getAbsenceStats = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT tipo, COUNT(*) AS total
      FROM solicitudes
      WHERE estado IN ('pendiente', 'aprobado')
      GROUP BY tipo
      ORDER BY total DESC, tipo
    `);

    return res.json(rows.map((row) => ({
      tipo: row.tipo,
      total: Number(row.total),
    })));
  } catch (error) {
    console.error("Error en getAbsenceStats:", error);
    return res.status(500).json({ message: "Error al obtener estadísticas de ausencias." });
  }
};

const getCalendar = async (req, res) => {
  try {
    const periodo = parsePeriodo(req.query);

    if (!periodo) {
      return res.status(400).json({ message: "Debes indicar un anio y un mes validos." });
    }

    const [rows] = await db.query(
      `
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
          DATEDIFF(s.fecha_fin, s.fecha_inicio) + 1 AS total_dias
        FROM solicitudes s
        INNER JOIN usuarios u ON u.id = s.usuario_id
        WHERE s.estado IN ('pendiente', 'aprobado')
          AND s.fecha_inicio <= ?
          AND s.fecha_fin >= ?
        ORDER BY s.fecha_inicio, u.nombre
      `,
      [periodo.fecha_fin, periodo.fecha_inicio],
    );

    return res.json({
      periodo,
      eventos: rows.map(mapSolicitudResumen),
    });
  } catch (error) {
    console.error("Error en getCalendar:", error);
    return res.status(500).json({ message: "Error al obtener el calendario del equipo." });
  }
};

const getDashboard = async (req, res) => {
  try {
    const periodo = parsePeriodo(req.query);

    if (!periodo) {
      return res.status(400).json({ message: "Debes indicar un anio y un mes validos." });
    }

    const [pendientesRows, historicoRows, calendarioRows, empleadosRows] = await Promise.all([
      db.query(
        `
          SELECT
            s.id,
            s.usuario_id,
            u.nombre,
            u.apellido AS apellidos,
            u.email,
            s.tipo,
            s.estado,
            s.fecha_inicio,
            s.fecha_fin,
            s.comentario,
            s.justificante_ref,
            DATEDIFF(s.fecha_fin, s.fecha_inicio) + 1 AS total_dias
          FROM solicitudes s
          INNER JOIN usuarios u ON u.id = s.usuario_id
          WHERE s.estado = 'pendiente'
          ORDER BY s.fecha_inicio, s.id
          LIMIT 10
        `,
      ),
      db.query(
        `
          SELECT
            COUNT(*) AS solicitudes_totales,
            SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) AS acciones_requeridas
          FROM solicitudes
        `,
      ),
      db.query(
        `
          SELECT
            s.id,
            s.usuario_id,
            u.nombre,
            u.apellido AS apellidos,
            u.email,
            s.tipo,
            s.estado,
            s.fecha_inicio,
            s.fecha_fin,
            s.comentario,
            s.justificante_ref,
            DATEDIFF(s.fecha_fin, s.fecha_inicio) + 1 AS total_dias
          FROM solicitudes s
          INNER JOIN usuarios u ON u.id = s.usuario_id
          WHERE s.estado IN ('pendiente', 'aprobado')
            AND s.fecha_inicio <= ?
            AND s.fecha_fin >= ?
          ORDER BY s.fecha_inicio, u.nombre
        `,
        [periodo.fecha_fin, periodo.fecha_inicio],
      ),
      db.query(
        `
          SELECT id, nombre, apellido AS apellidos, email, rol
          FROM usuarios
          ORDER BY nombre, apellido
        `,
      ),
    ]);

    const pendientes = pendientesRows[0].map(mapSolicitudResumen);
    const resumen = historicoRows[0][0] || {};

    return res.json({
      periodo,
      resumen: {
        solicitudes_pendientes: pendientes.length,
        acciones_requeridas: Number(resumen.acciones_requeridas || 0),
        solicitudes_historicas: Number(resumen.solicitudes_totales || 0),
      },
      solicitudes_pendientes: pendientes,
      calendario_equipo: calendarioRows[0].map(mapSolicitudResumen),
      empleados: empleadosRows[0].map((row) => ({
        id: Number(row.id),
        nombre: row.nombre,
        apellidos: row.apellidos,
        email: row.email,
        rol: row.rol,
      })),
    });
  } catch (error) {
    console.error("Error en getDashboard:", error);
    return res.status(500).json({ message: "Error al obtener el dashboard del manager." });
  }
};

const getRequestDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
        SELECT
          s.id,
          s.usuario_id,
          s.tipo,
          s.estado,
          s.fecha_inicio,
          s.fecha_fin,
          s.comentario,
          s.justificante_ref,
          s.created_at,
          DATEDIFF(s.fecha_fin, s.fecha_inicio) + 1 AS total_dias,
          u.nombre,
          u.apellido AS apellidos,
          u.email,
          u.rol,
          u.created_at AS usuario_created_at,
          u.dias_vacaciones_totales
        FROM solicitudes s
        INNER JOIN usuarios u ON u.id = s.usuario_id
        WHERE s.id = ?
        LIMIT 1
      `,
      [id],
    );

    const solicitud = rows[0];

    if (!solicitud) {
      return res.status(404).json({ message: "Solicitud no encontrada." });
    }

    const [balanceRows] = await db.query(
      `
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
      `,
      [solicitud.usuario_id],
    );

    const balance = balanceRows[0] || {};
    const diasTotales = Number(balance.dias_vacaciones_totales || 0);
    const diasConsumidos = Number(balance.dias_consumidos || 0);
    const diasPendientes = Number(balance.dias_pendientes || 0);

    return res.json({
      solicitud: {
        id: Number(solicitud.id),
        referencia: buildReferencia(solicitud.id, solicitud.fecha_inicio),
        tipo: solicitud.tipo,
        estado: solicitud.estado,
        fecha_inicio: solicitud.fecha_inicio,
        fecha_fin: solicitud.fecha_fin,
        total_dias: Number(solicitud.total_dias),
        comentario: solicitud.comentario,
        justificante_ref: solicitud.justificante_ref,
        created_at: solicitud.created_at,
        adjuntos: buildAdjuntos(solicitud.justificante_ref),
      },
      empleado: {
        id: Number(solicitud.usuario_id),
        nombre: solicitud.nombre,
        apellidos: solicitud.apellidos,
        email: solicitud.email,
        rol: solicitud.rol,
        fecha_ingreso: solicitud.usuario_created_at,
        departamento: null,
        reporta_a: null,
      },
      balance: {
        dias_totales: diasTotales,
        dias_consumidos: diasConsumidos,
        dias_pendientes: diasPendientes,
        dias_disponibles: Math.max(diasTotales - diasConsumidos, 0),
      },
    });
  } catch (error) {
    console.error("Error en getRequestDetail:", error);
    return res.status(500).json({ message: "Error al obtener el detalle de la solicitud." });
  }
};

const getEmployees = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, nombre, apellido AS apellidos, email, rol
      FROM usuarios
      ORDER BY nombre, apellido
    `);

    return res.json(
      rows.map((row) => ({
        id: Number(row.id),
        nombre: row.nombre,
        apellidos: row.apellidos,
        email: row.email,
        rol: row.rol,
      })),
    );
  } catch (error) {
    console.error("Error en getEmployees:", error);
    return res.status(500).json({ message: "Error al obtener empleados." });
  }
};

const sendEmail = async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({ message: "Debes indicar destinatario, asunto y mensaje." });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: message,
    });

    return res.json({ message: "Email enviado correctamente." });
  } catch (error) {
    console.error("Error en sendEmail:", error);
    return res.status(500).json({ message: "Error al enviar email." });
  }
};

module.exports = {
  getPendingVacations,
  approveVacation,
  rejectVacation,
  getOccupationStats,
  getAbsenceStats,
  getCalendar,
  getDashboard,
  getRequestDetail,
  getEmployees,
  sendEmail,
};
