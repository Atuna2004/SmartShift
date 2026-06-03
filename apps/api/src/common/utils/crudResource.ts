import type { Request, Response } from "express";
import type { Model } from "mongoose";
import { AppError } from "../errors/AppError.js";
import { catchAsync } from "./catchAsync.js";
import { sendResponse } from "./response.js";

// Mongoose models in this codebase use module-specific Document interfaces.
// The CRUD factory only needs the common Model surface.
type CrudModel = Model<any>;

type CrudResourceConfig = {
  model: CrudModel;
  resourceName: string;
};

const getResourceId = (req: Request) => {
  const id = req.params.id;

  if (!id) {
    throw new AppError(400, "Resource id is required");
  }

  return id;
};

export const createCrudController = ({ model, resourceName }: CrudResourceConfig) => {
  const create = catchAsync(async (req: Request, res: Response) => {
    const result = await model.create(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: `${resourceName} created successfully`,
      data: result,
    });
  });

  const list = catchAsync(async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      model.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      model.countDocuments(),
    ]);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `${resourceName} list retrieved successfully`,
      data: {
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        data: items,
      },
    });
  });

  const getById = catchAsync(async (req: Request, res: Response) => {
    const result = await model.findById(getResourceId(req));

    if (!result) {
      throw new AppError(404, `${resourceName} not found`);
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `${resourceName} retrieved successfully`,
      data: result,
    });
  });

  const update = catchAsync(async (req: Request, res: Response) => {
    const result = await model.findByIdAndUpdate(getResourceId(req), req.body, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      throw new AppError(404, `${resourceName} not found`);
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `${resourceName} updated successfully`,
      data: result,
    });
  });

  const remove = catchAsync(async (req: Request, res: Response) => {
    const result = await model.findByIdAndDelete(getResourceId(req));

    if (!result) {
      throw new AppError(404, `${resourceName} not found`);
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `${resourceName} deleted successfully`,
      data: result,
    });
  });

  return {
    create,
    list,
    getById,
    update,
    remove,
  };
};
