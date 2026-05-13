import type { Request, Response, NextFunction } from "express";

// Creating reusable wrapper function
export function asyncHandler(
  // asyncHandler accepts another async function Because async functions return Promises
  func: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  // This returns a normal Express middleware function.So Express can use it directly in routes.
  return (req: Request, res: Response, next: NextFunction) => {
    func(req, res, next).catch(next);
  };
}
