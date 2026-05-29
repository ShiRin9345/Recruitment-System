import type {
  CreatePositionInput,
  ImportResult,
  Position,
  PositionFilters,
  PositionStatus,
  UpdatePositionInput
} from "../types/position.js";
import { POSITION_STATUSES } from "../types/position.js";
import { AppError } from "../utils/appError.js";
import type { PositionRepository } from "./repository.js";

const EDITABLE_STATUSES: PositionStatus[] = ["DRAFT", "REJECTED", "PUBLISHED"];
const DELETABLE_STATUSES: PositionStatus[] = ["DRAFT", "REJECTED"];
const SUBMITTABLE_STATUSES: PositionStatus[] = ["DRAFT", "REJECTED"];

export class PositionService {
  constructor(private readonly repository: PositionRepository) {}

  async create(input: CreatePositionInput): Promise<Position> {
    return this.repository.create(this.normalizeInput(input));
  }

  async list(filters: PositionFilters = {}): Promise<Position[]> {
    return this.repository.findAll(filters);
  }

  async getById(id: number): Promise<Position> {
    const position = await this.repository.findById(id);
    if (!position) {
      throw new AppError(404, "岗位不存在");
    }
    return position;
  }

  async update(id: number, input: UpdatePositionInput): Promise<Position> {
    const position = await this.getById(id);
    this.ensureEditable(position);
    return this.repository.update(id, this.normalizeInput(input));
  }

  async delete(id: number): Promise<void> {
    const position = await this.getById(id);
    this.ensureStatus(position, DELETABLE_STATUSES, "只有草稿或驳回岗位可以删除");
    await this.repository.delete(id);
  }

  async submit(id: number): Promise<Position> {
    const position = await this.getById(id);
    this.ensureStatus(position, SUBMITTABLE_STATUSES, "只有草稿或驳回岗位可以提交审批");
    return this.repository.setStatus(id, "PENDING", { approvalComment: null });
  }

  async approve(id: number): Promise<Position> {
    const position = await this.getById(id);
    this.ensureStatus(position, ["PENDING"], "只有待审批岗位可以审批通过");
    return this.repository.setStatus(id, "PUBLISHED", {
      approvalComment: null,
      publishedAt: new Date().toISOString()
    });
  }

  async reject(id: number, comment: string): Promise<Position> {
    const position = await this.getById(id);
    this.ensureStatus(position, ["PENDING"], "只有待审批岗位可以驳回");
    const normalizedComment = comment.trim();
    if (!normalizedComment) {
      throw new AppError(400, "审批意见不能为空");
    }
    return this.repository.setStatus(id, "REJECTED", {
      approvalComment: normalizedComment
    });
  }

  async close(id: number): Promise<Position> {
    const position = await this.getById(id);
    this.ensureStatus(position, ["PUBLISHED"], "只有已发布岗位可以关闭");
    return this.repository.setStatus(id, "CLOSED", {
      closedAt: new Date().toISOString()
    });
  }

  async stats() {
    return this.repository.stats();
  }

  async importRows(rows: Array<{ title?: unknown; description?: unknown; rowNumber: number }>): Promise<ImportResult> {
    let imported = 0;
    const errors: ImportResult["errors"] = [];

    for (const row of rows) {
      const title = typeof row.title === "string" ? row.title.trim() : "";
      const description = typeof row.description === "string" ? row.description.trim() : "";

      if (!title && !description) {
        continue;
      }

      if (!title) {
        errors.push({ rowNumber: row.rowNumber, message: "岗位名称不能为空" });
        continue;
      }

      if (!description) {
        errors.push({ rowNumber: row.rowNumber, message: "岗位描述不能为空" });
        continue;
      }

      await this.repository.create({ title, description });
      imported += 1;
    }

    return {
      imported,
      failed: errors.length,
      errors
    };
  }

  validateStatus(status: unknown): PositionStatus | undefined {
    if (typeof status !== "string" || status.trim() === "") {
      return undefined;
    }
    if (!POSITION_STATUSES.includes(status as PositionStatus)) {
      throw new AppError(400, "岗位状态不合法");
    }
    return status as PositionStatus;
  }

  private normalizeInput<T extends CreatePositionInput | UpdatePositionInput>(input: T): T {
    return {
      title: input.title.trim(),
      description: input.description.trim()
    } as T;
  }

  private ensureEditable(position: Position) {
    this.ensureStatus(position, EDITABLE_STATUSES, "只有草稿、驳回或已发布岗位可以编辑");
  }

  private ensureStatus(position: Position, allowedStatuses: PositionStatus[], message: string) {
    if (!allowedStatuses.includes(position.status)) {
      throw new AppError(409, message);
    }
  }
}
