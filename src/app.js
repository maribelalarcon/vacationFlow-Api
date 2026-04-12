const express = require("express");
const db = require("./db");
const app = express();
const PORT = 3000;
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// Middleware
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/test2", (req, res) => {
  res.send("users route test");
});

// Ruta de prueba
app.get("/test", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1");
    res.json(rows);
  } catch (error) {
    res.send("API funcionando");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo`);
});
