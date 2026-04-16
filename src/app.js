const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");
const calendarioRoutes = require("./routes/calendario");
const solicitudesRoutes = require("./routes/solicitudes");
const yoRoutes = require("./routes/yo");
const app = express();
const PORT = 3000;
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/calendario", calendarioRoutes);
app.use("/solicitudes", solicitudesRoutes);
app.use("/yo", yoRoutes);

app.get("/test2", (req, res) => {
  res.send("Ruta de usuarios operativa");
});

// Ruta de prueba
app.get("/test", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1");
    res.json(rows);
  } catch (error) {
    res.send("API no funciona");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo`);
});
