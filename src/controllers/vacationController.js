const db = require("../db");

// Crear solicitud de vacaciones
exports.createVacation = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { start_date, end_date, type } = req.body;

    // Validación
    if (!start_date || !end_date) {
      return res.status(400).json({ message: "Fechas obligatorias" });
    }

    await db.query(
      `INSERT INTO vacations (user_id, start_date, end_date, type)
       VALUES (?, ?, ?, ?)`,
      [userId, start_date, end_date, type || "vacaciones"]
    );

    res.status(201).json({ message: "Solicitud enviada correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear solicitud" });
  }
};