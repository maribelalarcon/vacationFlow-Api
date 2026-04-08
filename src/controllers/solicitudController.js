const Solicitud = require("../models/solicitudModel");
const Usuario = require("../models/usuarioModel");

const TIPOS_SOLICITUD = [
  "vacaciones",
  "baja_medica",
  "asuntos_propios",
];

const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const crearSolicitud = async (req, res) => {
  try {
    const {
      usuario_id,
      tipo,
      fecha_inicio,
      fecha_fin,
      comentario,
      justificante_ref,
    } = req.body;

    if (!usuario_id || !tipo || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ message: "Faltan campos obligatorios." });
    }

    if (!TIPOS_SOLICITUD.includes(tipo)) {
      return res.status(400).json({ message: "El tipo de solicitud no es válido." });
    }

    const usuario = await Usuario.findById(usuario_id);

    if (!usuario) {
      return res.status(404).json({ message: "El usuario no existe." });
    }

    const inicio = parseDate(fecha_inicio);
    const fin = parseDate(fecha_fin);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (!inicio || !fin) {
      return res.status(400).json({ message: "Las fechas no son válidas." });
    }

    if (inicio < hoy) {
      return res
        .status(400)
        .json({ message: "La fecha de inicio no puede ser anterior a hoy." });
    }

    if (fin < inicio) {
      return res
        .status(400)
        .json({
          message: "La fecha de fin debe ser posterior a la fecha de inicio.",
        });
    }

    const result = await Solicitud.create({
      usuario_id,
      tipo,
      fecha_inicio,
      fecha_fin,
      comentario: comentario || null,
      justificante_ref: justificante_ref || null,
    });

    res.status(201).json({
      message: "Solicitud creada correctamente.",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error en Controller:", error);
    res
      .status(500)
      .json({ message: "Hubo un problema al procesar la solicitud." });
  }
};

const subirJustificante = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Debes subir un archivo." });
  }

  const justificanteRef = `/uploads/${req.file.filename}`;

  return res.status(201).json({
    message: "Justificante subido correctamente.",
    justificante_ref: justificanteRef,
    nombre_archivo: req.file.filename,
  });
};

const obtenerDisponibilidad = async (req, res) => {
  try {
    const { usuario_id } = req.query;

    if (!usuario_id) {
      return res.status(400).json({ message: "El usuario_id es obligatorio." });
    }

    const disponibilidad = await Solicitud.getDisponibilidadByUsuario(usuario_id);

    if (!disponibilidad) {
      return res.status(404).json({ message: "El usuario no existe." });
    }

    const diasTotales = Number(disponibilidad.dias_vacaciones_totales) || 0;
    const diasConsumidos = Number(disponibilidad.dias_consumidos) || 0;
    const diasPendientes = Number(disponibilidad.dias_pendientes) || 0;
    const diasDisponibles = Math.max(diasTotales - diasConsumidos, 0);

    return res.json({
      usuario_id: Number(disponibilidad.usuario_id),
      dias_totales: diasTotales,
      dias_consumidos: diasConsumidos,
      dias_pendientes: diasPendientes,
      dias_disponibles: diasDisponibles,
    });
  } catch (error) {
    console.error("Error en Controller:", error);
    return res
      .status(500)
      .json({ message: "Hubo un problema al consultar la disponibilidad." });
  }
};

module.exports = { crearSolicitud, subirJustificante, obtenerDisponibilidad };
