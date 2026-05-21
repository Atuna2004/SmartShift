import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError.js";
import type { AuthTokenPayload } from "../utils/jwt.js";
import { UserModel } from "../../modules/user/user.model.js";
import type { IUser } from "../../modules/user/user.model.js";

const getJwtSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new AppError(500, "JWT access secret is not configured");
  }

  return secret;
};

const buildAuthPayload = (user: IUser): AuthTokenPayload => {
  const payload: AuthTokenPayload = {
    userId: user._id.toString(),
    role: user.role,
  };

  if (user.organizationId) {
    payload.organizationId = user.organizationId.toString();
  }

  if (user.branchId) {
    payload.branchId = user.branchId.toString();
  }

  return payload;
};

export const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [scheme, token] = req.headers.authorization?.split(" ") ?? [];

      if (scheme !== "Bearer" || !token) {
        throw new AppError(401, "You are not authorized");
      }

      const decoded = jwt.verify(token, getJwtSecret()) as AuthTokenPayload;

      if (!decoded.userId) {
        throw new AppError(401, "Invalid token");
      }

      const user = await UserModel.findById(decoded.userId);

      if (!user) {
        throw new AppError(401, "User no longer exists");
      }

      if (user.status !== "active") {
        throw new AppError(403, "User account is inactive");
      }

      if (roles.length && !roles.includes(user.role)) {
        throw new AppError(403, "Forbidden access");
      }

      req.user = buildAuthPayload(user);

      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
        return;
      }

      next(new AppError(401, "Invalid or expired token"));
    }
  };
};
