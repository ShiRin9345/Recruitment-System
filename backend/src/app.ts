import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { createPositionRouter } from "./positions/router.js";
import type { PositionService } from "./positions/service.js";
import { sendSuccess } from "./utils/response.js";

interface CreateAppOptions {
  positionService: PositionService;
}

export const createApp = ({ positionService }: CreateAppOptions) => {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/webapi/health", (_req, res) => {
    sendSuccess(res, { status: "ok" });
  });

  app.use("/webapi/positions", createPositionRouter(positionService));
  app.use(errorHandler);

  return app;
};
