import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const hasConnectionString = Boolean(process.env.DATABASE_URL);
const useSsl = process.env.DB_SSL === "true";
const commonConfig = {
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
};

const pool = new Pool(
  hasConnectionString
    ? {
        ...commonConfig,
        connectionString: process.env.DATABASE_URL,
        ssl: useSsl ? { rejectUnauthorized: false } : false,
      }
    : {
        ...commonConfig,
        user: process.env.DB_USER || "prem",
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME || "spark_portfolio",
        password: process.env.DB_PASSWORD || undefined,
        port: Number(process.env.DB_PORT || 5432),
        ssl: useSsl ? { rejectUnauthorized: false } : false,
      }
);

export default pool;
