const Solicitud = require("../models/solicitudModel");

const crearSolicitud = async (req, res) => {
  try {
    const { usuario_id, tipo, fecha_inicio, fecha_fin, comentario } = req.body;

    // 1. Validar que no falten campos obligatorios
    if (!usuario_id || !tipo || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ message: "Faltan campos obligatorios." });
    }

    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas

    // 2. Validar que la fecha de inicio no sea en el pasado
    if (inicio < hoy) {
      return res
        .status(400)
        .json({ message: "La fecha de inicio no puede ser anterior a hoy." });
    }

    // 3. Validar que la fecha de fin sea después de la de inicio
    if (fin < inicio) {
      return res
        .status(400)
        .json({
          message: "La fecha de fin debe ser posterior a la fecha de inicio.",
        });
    }

    // Si todo está bien, llamamos al Modelo
    const result = await Solicitud.create({
      usuario_id,
      tipo,
      fecha_inicio,
      fecha_fin,
      comentario: comentario || null,
    });

    res.status(201).json({
      message: "Solicitud de vacaciones creada correctamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error en Controller:", error);
    res
      .status(500)
      .json({ message: "Hubo un problema al procesar la solicitud." });
  }
};

module.exports = { crearSolicitud };
