import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

/**
 * Handle uncaught exceptions
 * These are synchronous errors that occur outside of Express
 */
process.on("uncaughtException", (err: Error) => {
  console.log("💥 UNCAUGHT EXCEPTION! Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

/**
 * Start the server
 */
async function startServer() {
  try {
    // Connect to database
    await prisma.$connect();
    console.log("Database connected successfully");

    // Start Express server
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    /**
     * Handle unhandled promise rejections
     * These are async errors that aren't caught anywhere
     */
    process.on("unhandledRejection", (err: Error) => {
      console.log(
        "💥 UNHANDLED REJECTION! Shutting down..."
      );
      console.log(err.name, err.message);

      server.close(() => {
        process.exit(1);
      });
    });

    /**
     * Graceful shutdown on SIGTERM
     */
    process.on("SIGTERM", async () => {
      console.log(
        "SIGTERM received. Shutting down gracefully..."
      );

      await prisma.$disconnect();
      server.close(() => {
        console.log("Process terminated");
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
