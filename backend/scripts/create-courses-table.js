import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import pool from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const sqlPath = resolve(__dirname, "../sql/002_create_courses_table.sql");

try {
  const sql = await readFile(sqlPath, "utf8");
  await pool.query(sql);
  console.log("CREATE_TABLE_OK");
  console.log("courses table is ready");
} catch (error) {
  console.error("CREATE_TABLE_ERROR");
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
