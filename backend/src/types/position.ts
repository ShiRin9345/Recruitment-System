export const POSITION_STATUSES = ["DRAFT", "PENDING", "REJECTED", "PUBLISHED", "CLOSED"] as const;

export type PositionStatus = (typeof POSITION_STATUSES)[number];

export interface Position {
  id: number;
  title: string;
  description: string;
  status: PositionStatus;
  approvalComment: string | null;
  publishedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePositionInput {
  title: string;
  description: string;
}

export interface UpdatePositionInput {
  title: string;
  description: string;
}

export interface PositionFilters {
  keyword?: string;
  status?: PositionStatus;
}

export interface ImportError {
  rowNumber: number;
  message: string;
}

export interface ImportResult {
  imported: number;
  failed: number;
  errors: ImportError[];
}

export interface PositionStats {
  total: number;
  byStatus: Record<PositionStatus, number>;
}
