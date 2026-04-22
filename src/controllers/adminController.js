const db = require("../db");

// Utilizamos la extensión nodemailer para la botonera de enviar mails a empleados
const nodemailer = require("nodemailer");


// Obtener solicitudes pendientes
exports.getPendingVacations = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.*, u.nombre, u.apellidos, u.email
      FROM vacations v
      JOIN users u ON v.user_id = u.id
      WHERE v.status = 'pendiente'
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener solicitudes" });
  }
};


// Aprobar solicitud
exports.approveVacation = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "UPDATE vacations SET status = 'aprobado' WHERE id = ?",
      [id]
    );

    res.json({ message: "Solicitud aprobada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al aprobar solicitud" });
  }
};


// Rechazar solicitud
exports.rejectVacation = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "UPDATE vacations SET status = 'rechazado' WHERE id = ?",
      [id]
    );

    res.json({ message: "Solicitud rechazada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al rechazar solicitud" });
  }
};


// Esto es para el gráfico de ocupación mensual, muestra el porcentaje de trabajadores en activo por cada mes
exports.getOccupationStats = async (req, res) => {
  try {
    const [totalUsers] = await db.query("SELECT COUNT(*) as total FROM users");

    const [vacations] = await db.query(`
      SELECT MONTH(start_date) as mes, COUNT(*) as total
      FROM vacations
      WHERE status = 'aprobado'
      GROUP BY mes
    `);

    res.json({
      totalUsuarios: totalUsers[0].total,
      vacaciones
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en estadísticas" });
  }
};


// Motivos de ausencias, vacaciones o bajas
exports.getAbsenceStats = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT type, COUNT(*) as total
      FROM vacations
      WHERE status = 'aprobado'
      GROUP BY type
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en estadísticas de ausencias" });
  }
};


// Calendario de equipo
exports.getCalendar = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.*, u.nombre, u.apellidos
      FROM vacations v
      JOIN users u ON v.user_id = u.id
      WHERE v.status = 'aprobado'
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener calendario" });
  }
};


// Enviar email a empleados
exports.sendEmail = async (req, res) => {
  try {
    const { to, subject, message } = req.body;

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

    res.json({ message: "Email enviado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al enviar email" });
  }
};