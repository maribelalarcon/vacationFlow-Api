const express = require("express");
const path = require("path");
const db = require("./db");
const solicitudesRoutes = require("./routes/solicitudes");
const yoRoutes = require("./routes/yo");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

// Ruta de prueba
app.get("/test", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1");
    res.json(rows);
  } catch (error) {
    res.send("API funcionando 🚀");
  }
});

app.use("/solicitudes", solicitudesRoutes);
app.use("/yo", yoRoutes);

const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo`);
});

module.exports = server;
