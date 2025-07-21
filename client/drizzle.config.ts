import { defineConfig,  } from "drizzle-kit";

export default defineConfig({
    dialect: "sqlite",
    out: './drizzle',
    schema: "./db/schema.ts",
    dbCredentials: {
        url: process.env.DB_FILE_NAME!,
    },
});