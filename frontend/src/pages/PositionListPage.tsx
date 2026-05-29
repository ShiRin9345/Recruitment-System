import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Eye,
  FileCheck2,
  Lock,
  Pencil,
  Plus,
  Search,
  Trash2,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRole } from "@/lib/RoleContext";
import { positionsApi } from "@/lib/api";
import { statusBadgeVariants, statusLabels } from "@/lib/positionMeta";
import { POSITION_STATUSES, type Position, type PositionStatus } from "@/types/position";

type StatusFilter = PositionStatus | "ALL";

const formatDateTime = (value: string | null) => (value ? new Date(value).toLocaleString("zh-CN") : "-");

export const PositionListPage = () => {
  const { role } = useRole();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<StatusFilter>(
    role === "APPROVER" ? "PENDING" : role === "VISITOR" ? "PUBLISHED" : "ALL"
  );
  const [selected, setSelected] = useState<Position | null>(null);
  const [rejecting, setRejecting] = useState<Position | null>(null);
  const [rejectComment, setRejectComment] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const effectiveStatus = role === "APPROVER" ? "PENDING" : role === "VISITOR" ? "PUBLISHED" : status;
  const filters = useMemo(() => ({ keyword, status: effectiveStatus }), [keyword, effectiveStatus]);
  const positionsQuery = useQuery({
    queryKey: ["positions", filters],
    queryFn: () => positionsApi.list(filters)
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["positions"] });
    void queryClient.invalidateQueries({ queryKey: ["stats"] });
  };

  const actionMutation = useMutation({
    mutationFn: async ({ action, position, comment }: { action: string; position: Position; comment?: string }) => {
      if (action === "submit") return positionsApi.submit(position.id);
      if (action === "approve") return positionsApi.approve(position.id);
      if (action === "reject") return positionsApi.reject(position.id, comment ?? "");
      if (action === "close") return positionsApi.close(position.id);
      if (action === "delete") return positionsApi.remove(position.id);
      throw new Error("未知操作");
    },
    onSuccess: () => {
      setMessage("操作已完成");
      setRejecting(null);
      setRejectComment("");
      refresh();
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : "操作失败")
  });

  const canEdit = (position: Position) =>
    role === "ADMIN" && ["DRAFT", "REJECTED", "PUBLISHED"].includes(position.status);
  const canSubmit = (position: Position) => role === "ADMIN" && ["DRAFT", "REJECTED"].includes(position.status);
  const canDelete = (position: Position) => role === "ADMIN" && ["DRAFT", "REJECTED"].includes(position.status);
  const canApprove = (position: Position) => role === "APPROVER" && position.status === "PENDING";
  const canClose = (position: Position) => role === "ADMIN" && position.status === "PUBLISHED";
  const titleByRole = {
    ADMIN: "岗位管理",
    APPROVER: "审批处理",
    VISITOR: "岗位浏览"
  }[role];
  const descriptionByRole = {
    ADMIN: "管理岗位草稿、审批、发布和关闭流程",
    APPROVER: "处理当前待审批的岗位",
    VISITOR: "浏览已经发布的岗位"
  }[role];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal">{titleByRole}</h2>
          <p className="mt-1 text-sm text-slate-500">{descriptionByRole}</p>
        </div>
        {role === "ADMIN" ? (
          <Button asChild>
            <Link to="/positions/new">
              <Plus className="h-4 w-4" />
              新增岗位
            </Link>
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{role === "APPROVER" ? "待审批岗位" : role === "VISITOR" ? "已发布岗位" : "岗位列表"}</CardTitle>
          <CardDescription>
            {role === "ADMIN" ? "支持按岗位名称模糊搜索和状态筛选" : "可按岗位名称模糊搜索"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="搜索岗位名称"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
            </div>
            {role === "ADMIN" ? (
              <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">全部状态</SelectItem>
                  {POSITION_STATUSES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {statusLabels[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex h-9 items-center rounded-md border border-slate-200 bg-slate-100 px-3 text-sm text-slate-600">
                {role === "APPROVER" ? "仅显示待审批岗位" : "仅显示已发布岗位"}
              </div>
            )}
          </div>

          {message ? (
            <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {message}
            </div>
          ) : null}

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] border-collapse bg-white text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">岗位名称</th>
                    <th className="px-4 py-3 font-semibold">状态</th>
                    <th className="px-4 py-3 font-semibold">更新时间</th>
                    <th className="px-4 py-3 font-semibold">审批意见</th>
                    <th className="px-4 py-3 text-right font-semibold">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {positionsQuery.isLoading ? (
                    <tr>
                      <td className="px-4 py-8 text-center text-slate-500" colSpan={5}>
                        正在加载岗位数据
                      </td>
                    </tr>
                  ) : positionsQuery.data?.length ? (
                    positionsQuery.data.map((position) => (
                      <tr key={position.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-950">{position.title}</div>
                          <div className="mt-1 line-clamp-1 max-w-md text-xs text-slate-500">{position.description}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusBadgeVariants[position.status]}>{statusLabels[position.status]}</Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{formatDateTime(position.updatedAt)}</td>
                        <td className="max-w-52 px-4 py-3 text-slate-600">
                          <span className="line-clamp-2">{position.approvalComment ?? "-"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setSelected(position)} title="查看详情">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canEdit(position) ? (
                              <Button asChild variant="outline" size="sm">
                                <Link to={`/positions/${position.id}/edit`} title="编辑">
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                            ) : null}
                            {canSubmit(position) ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => actionMutation.mutate({ action: "submit", position })}
                              >
                                <FileCheck2 className="h-4 w-4" />
                                提交
                              </Button>
                            ) : null}
                            {canApprove(position) ? (
                              <>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => actionMutation.mutate({ action: "approve", position })}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  通过
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setRejecting(position)}>
                                  <XCircle className="h-4 w-4" />
                                  驳回
                                </Button>
                              </>
                            ) : null}
                            {canClose(position) ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => actionMutation.mutate({ action: "close", position })}
                              >
                                <Lock className="h-4 w-4" />
                                关闭
                              </Button>
                            ) : null}
                            {canDelete(position) ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (window.confirm("确认删除该岗位吗？")) {
                                    actionMutation.mutate({ action: "delete", position });
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-8 text-center text-slate-500" colSpan={5}>
                        暂无岗位数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>岗位详情</DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="space-y-4">
              <Badge variant={statusBadgeVariants[selected.status]}>{statusLabels[selected.status]}</Badge>
              <div className="whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {selected.description}
              </div>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">创建时间</dt>
                  <dd className="font-medium">{formatDateTime(selected.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">更新时间</dt>
                  <dd className="font-medium">{formatDateTime(selected.updatedAt)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">发布时间</dt>
                  <dd className="font-medium">{formatDateTime(selected.publishedAt)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">关闭时间</dt>
                  <dd className="font-medium">{formatDateTime(selected.closedAt)}</dd>
                </div>
              </dl>
              {selected.approvalComment ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {selected.approvalComment}
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(rejecting)} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>驳回岗位</DialogTitle>
            <DialogDescription>填写审批意见后，该岗位将回到已驳回状态</DialogDescription>
          </DialogHeader>
          <Textarea value={rejectComment} onChange={(event) => setRejectComment(event.target.value)} placeholder="请输入审批意见" />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRejecting(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectComment.trim() || !rejecting}
              onClick={() => rejecting && actionMutation.mutate({ action: "reject", position: rejecting, comment: rejectComment })}
            >
              确认驳回
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
