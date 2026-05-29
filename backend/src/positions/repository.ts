import type {
  CreatePositionInput,
  Position,
  PositionFilters,
  PositionStats,
  PositionStatus,
  UpdatePositionInput
} from "../types/position.js";

export interface PositionRepository {
  create(input: CreatePositionInput): Promise<Position>;
  findAll(filters?: PositionFilters): Promise<Position[]>;
  findById(id: number): Promise<Position | null>;
  update(id: number, input: UpdatePositionInput): Promise<Position>;
  delete(id: number): Promise<void>;
  setStatus(id: number, status: PositionStatus, values?: Partial<Pick<Position, "approvalComment" | "publishedAt" | "closedAt">>): Promise<Position>;
  stats(): Promise<PositionStats>;
}
