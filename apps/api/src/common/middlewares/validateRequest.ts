import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../errors/AppError.js";

type ValidatedRequest = {
  body?: unknown;
  params?: Record<string, string>;
  query?: Request["query"];
};

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => issue.message)
        .join(", ");

      throw new AppError(400, message || "Validation failed");
    }

    const data = result.data as ValidatedRequest;

    if (data.body) {
      req.body = data.body;
    }

    if (data.params) {
      req.params = data.params;
    }

    next();
  };
};
