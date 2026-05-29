import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type {
  CreatePositionInput,
  Position,
  PositionFilters,
  PositionStats,
  PositionStatus,
  UpdatePositionInput
} from "../types/position.js";
import { POSITION_STATUSES } from "../types/position.js";
import type { PositionRepository } from "./repository.js";

interface PositionRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  status: PositionStatus;
  approval_comment: string | null;
  published_at: Date | string | null;
  closed_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

type SqlParams = Record<string, string | number | Date | null>;

const toIso = (value: Date | string | null) => {
  if (value === null) {
    return null;
  }
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
};

const mapRow = (row: PositionRow): Position => ({
  id: Number(row.id),
  title: row.title,
  description: row.description,
  status: row.status,
  approvalComment: row.approval_comment,
  publishedAt: toIso(row.published_at),
  closedAt: toIso(row.closed_at),
  createdAt: toIso(row.created_at) ?? new Date().toISOString(),
  updatedAt: toIso(row.updated_at) ?? new Date().toISOString()
});

export class MysqlPositionRepository implements PositionRepository {
  constructor(private readonly pool: Pool) {}

  async create(input: CreatePositionInput): Promise<Position> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      "INSERT INTO positions (title, description, status) VALUES (:title, :description, 'DRAFT')",
      input as unknown as SqlParams
    );
    return this.findByIdOrThrow(result.insertId);
  }

  async findAll(filters: PositionFilters = {}): Promise<Position[]> {
    const where: string[] = [];
    const params: SqlParams = {};

    if (filters.keyword?.trim()) {
      where.push("title LIKE :keyword");
      params.keyword = `%${filters.keyword.trim()}%`;
    }

    if (filters.status) {
      where.push("status = :status");
      params.status = filters.status;
    }

    const sql = `
      SELECT * FROM positions
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY created_at DESC, id DESC
    `;
    const [rows] = await this.pool.execute<PositionRow[]>(sql, params);
    return rows.map(mapRow);
  }

  async findById(id: number): Promise<Position | null> {
    const [rows] = await this.pool.execute<PositionRow[]>("SELECT * FROM positions WHERE id = :id", { id });
    const row = rows[0];
    return row ? mapRow(row) : null;
  }

  async update(id: number, input: UpdatePositionInput): Promise<Position> {
    await this.pool.execute(
      "UPDATE positions SET title = :title, description = :description WHERE id = :id",
      { id, ...input }
    );
    return this.findByIdOrThrow(id);
  }

  async delete(id: number): Promise<void> {
    await this.pool.execute("DELETE FROM positions WHERE id = :id", { id });
  }

  async setStatus(
    id: number,
    status: PositionStatus,
    values: Partial<Pick<Position, "approvalComment" | "publishedAt" | "closedAt">> = {}
  ): Promise<Position> {
    await this.pool.execute(
      `
        UPDATE positions
        SET status = :status,
            approval_comment = :approvalComment,
            published_at = :publishedAt,
            closed_at = :closedAt
        WHERE id = :id
      `,
      {
        id,
        status,
        approvalComment: values.approvalComment ?? null,
        publishedAt: values.publishedAt ? new Date(values.publishedAt) : null,
        closedAt: values.closedAt ? new Date(values.closedAt) : null
      }
    );
    return this.findByIdOrThrow(id);
  }

  async stats(): Promise<PositionStats> {
    const byStatus = POSITION_STATUSES.reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {} as Record<PositionStatus, number>
    );
    const [rows] = await this.pool.execute<Array<RowDataPacket & { status: PositionStatus; count: number }>>(
      "SELECT status, COUNT(*) AS count FROM positions GROUP BY status"
    );

    for (const row of rows) {
      byStatus[row.status] = Number(row.count);
    }

    return {
      total: Object.values(byStatus).reduce((sum, count) => sum + count, 0),
      byStatus
    };
  }

  private async findByIdOrThrow(id: number): Promise<Position> {
    const position = await this.findById(id);
    if (!position) {
      throw new Error(`Position ${id} not found`);
    }
    return position;
  }
}
