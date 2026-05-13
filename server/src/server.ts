import "dotenv/config";
import express from "express";
import { connectDB } from "./db";
import cors from "cors";
import morgan from "morgan";
import { ok } from "./utils/envelop";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

// Creating async startup wrapper
async function mainEntryFunction() {
  await connectDB();

  const app = express();

  const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000")
    .split(",") // Converts: "a,b,c" -> ["a", "b", "c"]
    .map((origin) => origin.trim()) // Removes spaces
    .filter(Boolean); // Remove empty values ["", "abc"]->["abc"]

  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(morgan("dev")); // Logs request details in terminal

  app.get("/health", (_req, res) => {
    res.status(200).json(ok({ message: "Server is healthy/in running" }));
  });

  app.use(notFound); // Handles unmatched routes
  app.use(errorHandler); // Handles all backend errors

  const port = Number(process.env.PORT || 5000);

  app.listen(port, () => {
    console.log(`Server is now running on port ${port}`);
  });
}

mainEntryFunction().catch((err) => {
  console.error("Failed to start", err);
  process.exit(1);
});
