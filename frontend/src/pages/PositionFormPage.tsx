import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { positionsApi } from "@/lib/api";
import type { PositionFormValues } from "@/types/position";

const formSchema = z.object({
  title: z.string().trim().min(1, "请输入岗位名称").max(200, "岗位名称不能超过 200 个字符"),
  description: z.string().trim().min(1, "请输入岗位描述")
});

interface PositionFormPageProps {
  mode: "create" | "edit";
}

export const PositionFormPage = ({ mode }: PositionFormPageProps) => {
  const { id } = useParams();
  const positionId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const detailQuery = useQuery({
    queryKey: ["position", positionId],
    queryFn: () => positionsApi.detail(positionId),
    enabled: mode === "edit" && Number.isInteger(positionId)
  });

  const form = useForm<PositionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: ""
    }
  });

  useEffect(() => {
    if (detailQuery.data) {
      form.reset({
        title: detailQuery.data.title,
        description: detailQuery.data.description
      });
    }
  }, [detailQuery.data, form]);

  const saveMutation = useMutation({
    mutationFn: (values: PositionFormValues) =>
      mode === "create" ? positionsApi.create(values) : positionsApi.update(positionId, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["positions"] });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
      navigate("/positions");
    }
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button asChild variant="ghost">
        <Link to="/positions">
          <ArrowLeft className="h-4 w-4" />
          返回列表
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{mode === "create" ? "新增岗位" : "编辑岗位"}</CardTitle>
          <CardDescription>岗位描述可按岗位职责、任职要求、加分项分段填写</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}>
            <div className="space-y-2">
              <Label htmlFor="title">岗位名称</Label>
              <Input id="title" placeholder="例如：Java 后端开发实习生" {...form.register("title")} />
              {form.formState.errors.title ? (
                <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">岗位描述</Label>
              <Textarea
                id="description"
                rows={10}
                placeholder={"岗位职责：\n任职要求：\n加分项："}
                {...form.register("description")}
              />
              {form.formState.errors.description ? (
                <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
              ) : null}
            </div>

            {saveMutation.error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {saveMutation.error instanceof Error ? saveMutation.error.message : "保存失败"}
              </div>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button asChild variant="secondary">
                <Link to="/positions">取消</Link>
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                <Save className="h-4 w-4" />
                保存
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
