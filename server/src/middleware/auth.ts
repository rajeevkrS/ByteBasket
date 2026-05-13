import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { User } from "../models/User";
import { asyncHandler } from "../utils/AsyncHandler";

// Check User is authenticated or not
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  // Get user ID from the authenticated request
  const { userId } = getAuth(req);

  if (!userId) {
    return next(new AppError(401, "Unauthorized- invalid token!"));
  }

  next();
}

// Finding User from our DB
export async function getDbUserFromReq(req: Request) {
  const { userId } = getAuth(req);

  if (!userId) {
    throw new AppError(401, "Unauthorized- invalid token!");
  }

  const dbUser = await User.findOne({ clerkUserId: userId });

  if (!userId) {
    throw new AppError(404, "User not found in DB!");
  }

  return dbUser;
}

// Check Current User has admin access or not
// Admin gate - user should logged in user + admin access
export const requireAdmin = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const extractCurrentDbUser = await getDbUserFromReq(req);

    if (extractCurrentDbUser.role !== "admin") {
      throw new AppError(403, "Admin access only!");
    }

    next();
  },
);
