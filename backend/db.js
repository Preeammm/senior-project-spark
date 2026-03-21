import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER || "prem",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "spark_portfolio",
  password: process.env.DB_PASSWORD || undefined,
  port: Number(process.env.DB_PORT || 5432),
});

export default pool;
