export const POSITION_STATUSES = ["DRAFT", "PENDING", "REJECTED", "PUBLISHED", "CLOSED"] as const;

export type PositionStatus = (typeof POSITION_STATUSES)[number];

export type Role = "ADMIN" | "APPROVER" | "VISITOR";

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

export interface PositionFormValues {
  title: string;
  description: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface ImportResult {
  imported: number;
  failed: number;
  errors: Array<{
    rowNumber: number;
    message: string;
  }>;
}

export interface PositionStats {
  total: number;
  byStatus: Record<PositionStatus, number>;
}
