const db = require("./db");

const ensureAvatarUrlColumn = async () => {
  const [rows] = await db.query(
    `
      SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'usuarios'
        AND COLUMN_NAME = 'avatar_url'
      LIMIT 1
    `
  );

  if (rows.length > 0) {
    return;
  }

  await db.query("ALTER TABLE usuarios ADD COLUMN avatar_url VARCHAR(255) NULL");
  console.log("Columna usuarios.avatar_url creada automaticamente.");
};

const ensureDatabaseSchema = async () => {
  await ensureAvatarUrlColumn();
};

module.exports = { ensureDatabaseSchema };
