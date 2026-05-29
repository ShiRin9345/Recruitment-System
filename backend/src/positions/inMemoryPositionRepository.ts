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

export class InMemoryPositionRepository implements PositionRepository {
  private positions: Position[] = [];
  private nextId = 1;

  async create(input: CreatePositionInput): Promise<Position> {
    const now = new Date().toISOString();
    const position: Position = {
      id: this.nextId++,
      title: input.title,
      description: input.description,
      status: "DRAFT",
      approvalComment: null,
      publishedAt: null,
      closedAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.positions.push(position);
    return { ...position };
  }

  async findAll(filters: PositionFilters = {}): Promise<Position[]> {
    const keyword = filters.keyword?.trim().toLowerCase();
    return this.positions
      .filter((position) => {
        const matchesKeyword = !keyword || position.title.toLowerCase().includes(keyword);
        const matchesStatus = !filters.status || position.status === filters.status;
        return matchesKeyword && matchesStatus;
      })
      .map((position) => ({ ...position }));
  }

  async findById(id: number): Promise<Position | null> {
    const position = this.positions.find((item) => item.id === id);
    return position ? { ...position } : null;
  }

  async update(id: number, input: UpdatePositionInput): Promise<Position> {
    const index = this.positions.findIndex((item) => item.id === id);
    const current = this.positions[index];
    if (!current) {
      throw new Error("Position not found");
    }
    const updated: Position = {
      ...current,
      ...input,
      updatedAt: new Date().toISOString()
    };
    this.positions[index] = updated;
    return { ...updated };
  }

  async delete(id: number): Promise<void> {
    this.positions = this.positions.filter((position) => position.id !== id);
  }

  async setStatus(
    id: number,
    status: PositionStatus,
    values: Partial<Pick<Position, "approvalComment" | "publishedAt" | "closedAt">> = {}
  ): Promise<Position> {
    const index = this.positions.findIndex((item) => item.id === id);
    const current = this.positions[index];
    if (!current) {
      throw new Error("Position not found");
    }
    const updated: Position = {
      ...current,
      status,
      ...values,
      updatedAt: new Date().toISOString()
    };
    this.positions[index] = updated;
    return { ...updated };
  }

  async stats(): Promise<PositionStats> {
    const byStatus = POSITION_STATUSES.reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {} as Record<PositionStatus, number>
    );

    for (const position of this.positions) {
      byStatus[position.status] += 1;
    }

    return {
      total: this.positions.length,
      byStatus
    };
  }
}
