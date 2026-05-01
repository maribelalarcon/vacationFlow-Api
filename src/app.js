const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");
const calendarioRoutes = require("./routes/calendario");
const solicitudesRoutes = require("./routes/solicitudes");
const yoRoutes = require("./routes/yo");
const app = express();
const PORT = process.env.PORT || 3000;
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const vacationRoutes = require("./routes/vacationRoutes");

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/calendario", calendarioRoutes);
app.use("/solicitudes", solicitudesRoutes);
app.use("/yo", yoRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vacations", vacationRoutes);

app.get("/", (_req, res) => {
  res.status(200).send("VacationFlow API OK");
});

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.get("/test2", (req, res) => {
  res.send("Ruta de usuarios operativa");
});

app.get("/test", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1");
    res.json(rows);
  } catch (error) {
    res.send("API no funciona");
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
