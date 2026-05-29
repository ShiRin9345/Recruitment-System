import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/appError.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
      data: null
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      code: 400,
      message: error.issues[0]?.message ?? "请求参数不合法",
      data: null
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    code: 500,
    message: "服务器内部错误",
    data: null
  });
};
