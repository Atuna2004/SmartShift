import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { AppError } from "../errors/AppError.js";

export type AuthTokenPayload = {
  userId: string;
  role: string;
  organizationId?: string;
  branchId?: string;
};

const getAccessSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new AppError(500, "JWT access secret is not configured");
  }

  return secret;
};

const getRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new AppError(500, "JWT refresh secret is not configured");
  }

  return secret;
};

export const createToken = (payload: AuthTokenPayload) => {
  const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ||
    "7d") as NonNullable<SignOptions["expiresIn"]>;

  return jwt.sign(payload, getAccessSecret(), {
    expiresIn,
  });
};

export const createRefreshToken = (payload: AuthTokenPayload) => {
  const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ||
    "30d") as NonNullable<SignOptions["expiresIn"]>;

  return jwt.sign(payload, getRefreshSecret(), {
    expiresIn,
  });
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, getRefreshSecret()) as AuthTokenPayload;
};
