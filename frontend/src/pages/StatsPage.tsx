import { useQuery } from "@tanstack/react-query";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { positionsApi } from "@/lib/api";
import { statusLabels } from "@/lib/positionMeta";
import { POSITION_STATUSES, type PositionStatus } from "@/types/position";

const chartColors: Record<PositionStatus, string> = {
  DRAFT: "#64748b",
  PENDING: "#d97706",
  REJECTED: "#dc2626",
  PUBLISHED: "#059669",
  CLOSED: "#52525b"
};

export const StatsPage = () => {
  const statsQuery = useQuery({
    queryKey: ["stats"],
    queryFn: positionsApi.stats
  });

  const data = POSITION_STATUSES.map((status) => ({
    status,
    name: statusLabels[status],
    value: statsQuery.data?.byStatus[status] ?? 0
  }));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold">统计看板</h2>
        <p className="mt-1 text-sm text-slate-500">按岗位状态统计当前招聘岗位数量</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardDescription>岗位总数</CardDescription>
            <CardTitle className="text-3xl">{statsQuery.data?.total ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        {data.map((item) => (
          <Card key={item.status}>
            <CardHeader>
              <CardDescription>{item.name}</CardDescription>
              <CardTitle className="text-3xl">{item.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>状态分布</CardTitle>
          <CardDescription>用于快速观察岗位审批和发布进度</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={120} paddingAngle={2}>
                  {data.map((entry) => (
                    <Cell key={entry.status} fill={chartColors[entry.status]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {data.map((item) => (
              <div key={item.status} className="flex items-center gap-2 text-sm text-slate-600">
                <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: chartColors[item.status] }} />
                {item.name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
