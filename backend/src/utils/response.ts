import type { Response } from "express";

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200) =>
  res.status(statusCode).json({
    code: 200,
    message: "success",
    data
  });
