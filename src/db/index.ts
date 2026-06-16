import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

// Detect Neon serverless URL and auto-enable SSL
const isNeonHost = databaseUrl.includes("neon.tech") || databaseUrl.includes("sslmode=require");

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    // Neon (and most cloud Postgres) require SSL. Enable when needed.
    ssl: isNeonHost ? { rejectUnauthorized: false } : undefined,
    // Serverless-friendly: don't hold connections forever
    max: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

// Listen for pool errors so they don't crash Vercel lambdas silently
pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err);
});

export const db = drizzle(pool, { schema });
