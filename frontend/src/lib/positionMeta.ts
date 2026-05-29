import type { PositionStatus, Role } from "@/types/position";

export const statusLabels: Record<PositionStatus, string> = {
  DRAFT: "草稿",
  PENDING: "待审批",
  REJECTED: "已驳回",
  PUBLISHED: "已发布",
  CLOSED: "已关闭"
};

export const statusBadgeVariants: Record<PositionStatus, "slate" | "amber" | "red" | "green" | "zinc"> = {
  DRAFT: "slate",
  PENDING: "amber",
  REJECTED: "red",
  PUBLISHED: "green",
  CLOSED: "zinc"
};

export const roleLabels: Record<Role, string> = {
  ADMIN: "招聘管理员",
  APPROVER: "审批人",
  VISITOR: "访客"
};

export const roleDescriptions: Record<Role, string> = {
  ADMIN: "维护岗位、导入 Excel、提交审批和关闭岗位",
  APPROVER: "处理待审批岗位的通过或驳回",
  VISITOR: "浏览已发布岗位和统计信息"
};
