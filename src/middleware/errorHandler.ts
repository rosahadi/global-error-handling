import { NextFunction, Request, Response } from "express";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientInitializationError,
  PrismaClientRustPanicError,
} from "@prisma/client/runtime/library";
import AppError from "../utils/appError";

interface ErrorWithCode extends Error {
  code?: string;
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

const handlePrismaValidationError = (
  err: PrismaClientValidationError
): AppError => {
  return new AppError(
    "Invalid input data. Please check your request.",
    400
  );
};

const handlePrismaKnownError = (
  err: PrismaClientKnownRequestError
): AppError => {
  const errorMap: Record<string, () => AppError> = {
    P2002: () => {
      const field =
        (err.meta?.target as string[])?.join(", ") ||
        "field";
      return new AppError(
        `Duplicate value found for ${field}. Please use a different value.`,
        409
      );
    },
    P2003: () => {
      const field =
        (err.meta?.field_name as string) ||
        (err.meta?.target as string) ||
        "unknown field";
      return new AppError(
        `Invalid reference for field: ${field}`,
        400
      );
    },
    P2025: () => new AppError("Record not found.", 404),
    P2021: () =>
      new AppError("The table does not exist.", 500),
    P2022: () =>
      new AppError("The column does not exist.", 500),
  };

  return (
    errorMap[err.code]?.() ||
    new AppError("Database error occurred.", 500)
  );
};

const handlePrismaInitializationError = (
  err: PrismaClientInitializationError
): AppError => {
  return new AppError(
    "Database connection failed. Please try again later.",
    500
  );
};

const handlePrismaRustPanicError = (
  err: PrismaClientRustPanicError
): AppError => {
  return new AppError(
    "Critical database error occurred. Please try again.",
    500
  );
};

// Development error response
const sendErrorDev = (
  err: ErrorWithCode,
  res: Response
): void => {
  res.status(err.statusCode || 500).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

// Production error response
const sendErrorProd = (
  err: ErrorWithCode,
  res: Response
): void => {
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

// Global error handling middleware
const globalErrorHandler = (
  err: ErrorWithCode,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  const isDev = process.env.NODE_ENV === "development";
  let error = err;

  if (err instanceof PrismaClientValidationError) {
    error = handlePrismaValidationError(err);
  } else if (err instanceof PrismaClientKnownRequestError) {
    error = handlePrismaKnownError(err);
  } else if (
    err instanceof PrismaClientInitializationError
  ) {
    error = handlePrismaInitializationError(err);
  } else if (err instanceof PrismaClientRustPanicError) {
    error = handlePrismaRustPanicError(err);
  }

  if (isDev) {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
