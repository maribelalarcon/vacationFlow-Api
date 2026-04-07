const express = require("express");
const db = require("./db");
const solicitudesRoutes = require("./routes/solicitudes");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Ruta de prueba
app.get("/test", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1");
    res.json(rows);
  } catch (error) {
    res.send("API funcionando 🚀");
  }
});

//API Solicitud
app.use("/solicitudes", solicitudesRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo`);
});
