import { Router } from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import { z } from "zod";
import type { PositionService } from "./service.js";
import { sendSuccess } from "../utils/response.js";
import { AppError } from "../utils/appError.js";

const positionSchema = z.object({
  title: z.string().trim().min(1, "岗位名称不能为空"),
  description: z.string().trim().min(1, "岗位描述不能为空")
});

const rejectSchema = z.object({
  comment: z.string().trim().min(1, "审批意见不能为空")
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const parseId = (value: string) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, "岗位 ID 不合法");
  }
  return id;
};

export const createPositionRouter = (service: PositionService) => {
  const router = Router();

  router.get("/", async (req, res, next) => {
    try {
      const status = service.validateStatus(req.query.status);
      const positions = await service.list({
        keyword: typeof req.query.keyword === "string" ? req.query.keyword : undefined,
        status
      });
      sendSuccess(res, positions);
    } catch (error) {
      next(error);
    }
  });

  router.get("/stats", async (_req, res, next) => {
    try {
      sendSuccess(res, await service.stats());
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      sendSuccess(res, await service.getById(parseId(req.params.id)));
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const input = positionSchema.parse(req.body);
      sendSuccess(res, await service.create(input), 201);
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      const input = positionSchema.parse(req.body);
      sendSuccess(res, await service.update(parseId(req.params.id), input));
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      await service.delete(parseId(req.params.id));
      sendSuccess(res, null);
    } catch (error) {
      next(error);
    }
  });

  router.post("/:id/submit", async (req, res, next) => {
    try {
      sendSuccess(res, await service.submit(parseId(req.params.id)));
    } catch (error) {
      next(error);
    }
  });

  router.post("/:id/approve", async (req, res, next) => {
    try {
      sendSuccess(res, await service.approve(parseId(req.params.id)));
    } catch (error) {
      next(error);
    }
  });

  router.post("/:id/reject", async (req, res, next) => {
    try {
      const input = rejectSchema.parse(req.body);
      sendSuccess(res, await service.reject(parseId(req.params.id), input.comment));
    } catch (error) {
      next(error);
    }
  });

  router.post("/:id/close", async (req, res, next) => {
    try {
      sendSuccess(res, await service.close(parseId(req.params.id)));
    } catch (error) {
      next(error);
    }
  });

  router.post("/import", upload.single("file"), async (req, res, next) => {
    try {
      if (!req.file) {
        throw new AppError(400, "请上传 Excel 文件");
      }

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new AppError(400, "Excel 文件没有工作表");
      }

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], {
        defval: ""
      });

      const importRows = rows.map((row, index) => ({
        title: row["岗位名称"],
        description: row["岗位描述"],
        rowNumber: index + 2
      }));

      sendSuccess(res, await service.importRows(importRows));
    } catch (error) {
      next(error);
    }
  });

  return router;
};
