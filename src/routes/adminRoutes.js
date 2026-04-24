const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get(
  "/dashboard",
  authMiddleware,
  adminMiddleware,
  adminController.getDashboard
);

router.get(
  "/requests/:id",
  authMiddleware,
  adminMiddleware,
  adminController.getRequestDetail
);

router.get(
  "/employees",
  authMiddleware,
  adminMiddleware,
  adminController.getEmployees
);

// Rutas para las solicitudes de vacaciones

// Ver solicitudes pendientes
router.get(
  "/vacations/pending",
  authMiddleware,
  adminMiddleware,
  adminController.getPendingVacations
);

// Aprobar solicitud
router.put(
  "/vacations/:id/approve",
  authMiddleware,
  adminMiddleware,
  adminController.approveVacation
);

// Rechazar solicitud
router.put(
  "/vacations/:id/reject",
  authMiddleware,
  adminMiddleware,
  adminController.rejectVacation
);


// Gráfico de ocupación

// Ocupación mensual
router.get(
  "/stats/occupation",
  authMiddleware,
  adminMiddleware,
  adminController.getOccupationStats
);

// Ausencias o bajas
router.get(
  "/stats/absences",
  authMiddleware,
  adminMiddleware,
  adminController.getAbsenceStats
);


// Calendario de equipo
router.get(
  "/calendar",
  authMiddleware,
  adminMiddleware,
  adminController.getCalendar
);


// Enviar email
router.post(
  "/send-email",
  authMiddleware,
  adminMiddleware,
  adminController.sendEmail
);


module.exports = router;
