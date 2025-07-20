import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

// Database connection with fallback
let sql: any;

try {
  if (process.env.DB_URL) {
    sql = neon(process.env.DB_URL);
  } else {
    console.log("⚠️ No database URL provided, using mock database");
    sql = {
      // Mock methods for testing
      async query(strings: any, ...values: any[]) {
        return { rows: [] };
      }
    };
  }
} catch (error) {
  console.log("⚠️ Database connection failed, using mock database");
  sql = {
    // Mock methods for testing
    async query(strings: any, ...values: any[]) {
      return { rows: [] };
    }
  };
}

export { sql };