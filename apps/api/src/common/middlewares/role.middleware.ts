import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      throw new AppError(401, "You are not authorized");
    }

    if (!roles.includes(userRole)) {
      throw new AppError(403, "Forbidden access");
    }

    next();
  };
};
