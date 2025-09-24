import * as dotenv from "dotenv";
import mysql, { Pool, RowDataPacket, ResultSetHeader } from "mysql2/promise";

dotenv.config();

export const pool: Pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "erp",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ✅ Helper types for queries
export type QueryRow = RowDataPacket[];
export type QueryResult = ResultSetHeader;
