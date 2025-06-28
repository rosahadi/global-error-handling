import express from "express";
import cors from "cors";
import helmet from "helmet";
import AppError from "./utils/appError";
import globalErrorHandler from "./middleware/errorHandler";
import userRoutes from "./routes/users";

const app = express();

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10kb" }));

// API routes
app.use("/api/users", userRoutes);

// Catch undefined routes
app.all("*", (req, res, next) => {
  next(
    new AppError(
      `Can't find ${req.originalUrl} on this server`,
      404
    )
  );
});

// Global error handler (must be last!)
app.use(globalErrorHandler);

export default app;
