import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import pool from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const sqlPath = resolve(__dirname, "../sql/spark_schema.sql");

try {
  const sql = await readFile(sqlPath, "utf8");
  const statements = sql
    .split(/;\s*\n/)
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await pool.query(statement);
  }

  console.log("CREATE_SCHEMA_OK");
  console.log("SPARK schema is ready");
} catch (error) {
  console.error("CREATE_SCHEMA_ERROR");
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
