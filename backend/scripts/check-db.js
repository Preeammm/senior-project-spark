import pool from "../db.js";

try {
  const result = await pool.query("SELECT NOW() AS now");
  console.log("CONNECT_OK");
  console.log(result.rows[0]);
} catch (error) {
  console.error("CONNECT_ERROR");
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
