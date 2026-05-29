import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { positionsApi } from "@/lib/api";
import type { ImportResult } from "@/types/position";

export const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: (targetFile: File) => positionsApi.import(targetFile),
    onSuccess: (data) => {
      setResult(data);
      void queryClient.invalidateQueries({ queryKey: ["positions"] });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
    }
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h2 className="text-2xl font-semibold">Excel 批量导入</h2>
        <p className="mt-1 text-sm text-slate-500">模板列名至少包含“岗位名称”和“岗位描述”</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            上传文件
          </CardTitle>
          <CardDescription>支持 .xlsx 和 .xls 文件，单个文件不超过 5MB</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <Button disabled={!file || importMutation.isPending} onClick={() => file && importMutation.mutate(file)}>
            <Upload className="h-4 w-4" />
            上传并导入
          </Button>

          {importMutation.error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {importMutation.error instanceof Error ? importMutation.error.message : "导入失败"}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {result ? (
        <Card>
          <CardHeader>
            <CardTitle>导入结果</CardTitle>
            <CardDescription>
              成功 {result.imported} 条，失败 {result.failed} 条
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result.errors.length ? (
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">行号</th>
                      <th className="px-4 py-3">错误原因</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.errors.map((error) => (
                      <tr key={`${error.rowNumber}-${error.message}`}>
                        <td className="px-4 py-3">{error.rowNumber}</td>
                        <td className="px-4 py-3 text-red-700">{error.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                文件中的岗位已全部导入为草稿状态
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};
