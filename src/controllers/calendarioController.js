const Solicitud = require("../models/solicitudModel");

const parsePeriodo = (query) => {
  const anio = Number(query.anio);
  const mes = Number(query.mes);

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

const getCalendarioMensual = async (req, res) => {
  try {
    const periodo = parsePeriodo(req.query);

    if (!periodo) {
      return res.status(400).json({
        message: "Debes indicar un anio y un mes validos.",
      });
    }

    const userId = req.user.userId;

    const [resumen, eventos, quienesFuera] = await Promise.all([
      Solicitud.getResumenCalendario(periodo.fecha_inicio, periodo.fecha_fin, userId),
      Solicitud.getEventosCalendario(periodo.fecha_inicio, periodo.fecha_fin, userId),
      Solicitud.getQuienesEstanFuera(periodo.fecha_inicio, periodo.fecha_fin),
    ]);

    return res.json({
      periodo,
      resumen,
      eventos,
      quienes_fuera: quienesFuera,
    });
  } catch (error) {
    console.error("Error en Controller:", error);
    return res.status(500).json({
      message: "Se produjo un error al obtener los datos del calendario.",
    });
  }
};

const getQuienesFuera = async (req, res) => {
  try {
    const periodo = parsePeriodo(req.query);

    if (!periodo) {
      return res.status(400).json({
        message: "Debes indicar un anio y un mes validos.",
      });
    }

    const quienesFuera = await Solicitud.getQuienesEstanFuera(
      periodo.fecha_inicio,
      periodo.fecha_fin,
    );

    return res.json({
      periodo,
      quienes_fuera: quienesFuera,
    });
  } catch (error) {
    console.error("Error en Controller:", error);
    return res.status(500).json({
      message: "Se produjo un error al obtener el listado de ausencias.",
    });
  }
};

module.exports = { getCalendarioMensual, getQuienesFuera };
