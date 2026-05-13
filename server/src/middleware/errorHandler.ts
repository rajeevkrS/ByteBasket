import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { fail } from "../utils/envelop";

// Global error handling middleware
export function errorHandler(
  err: unknown, // unknown- We dont know what kind of error is
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // check if error is created using custom AppError class
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(fail(err.message, "APP_ERROR"));
  }

  console.error("error", err);

  // If error is NOT AppError - send generic 500 response
  return res.status(500).json(fail("Internal server error", "INTERNAL"));
}

// _ prefix means:

// “Parameter exists because Express requires it, but we are not using it.”
