import { defineConfig } from 'drizzle-kit'
// import * as dotenv from "dotenv";
// dotenv.config({ path: ".env" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/drizzle",
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DB_URL,
  },
  verbose: true,
  strict: true,
})