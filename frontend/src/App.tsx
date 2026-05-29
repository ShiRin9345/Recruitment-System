import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { BarChart3, BriefcaseBusiness, FileSpreadsheet, UserRoundCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useRole } from "@/lib/RoleContext";
import { roleDescriptions, roleLabels } from "@/lib/positionMeta";
import type { Role } from "@/types/position";
import { PositionFormPage } from "@/pages/PositionFormPage";
import { PositionListPage } from "@/pages/PositionListPage";
import { StatsPage } from "@/pages/StatsPage";
import { UploadPage } from "@/pages/UploadPage";

const navItems = [
  { to: "/positions", label: "岗位管理", icon: BriefcaseBusiness },
  { to: "/import", label: "Excel 导入", icon: FileSpreadsheet },
  { to: "/stats", label: "统计看板", icon: BarChart3 }
];

export default function App() {
  const { role, setRole } = useRole();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">招聘岗位管理系统</h1>
              <p className="text-sm text-slate-500">岗位发布、审批、导入与统计</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <UserRoundCog className="h-4 w-4" />
              <span>当前角色</span>
            </div>
            <Select value={role} onValueChange={(value) => setRole(value as Role)}>
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["ADMIN", "APPROVER", "VISITOR"] as Role[]).map((item) => (
                  <SelectItem key={item} value={item}>
                    {roleLabels[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Button key={item.to} asChild variant="secondary">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    isActive ? "bg-slate-950 text-white hover:bg-slate-900" : undefined
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              </Button>
            ))}
          </nav>
          <p className="text-sm text-slate-500">{roleDescriptions[role]}</p>
        </div>
        <Separator className="mb-6" />

        <Routes>
          <Route path="/" element={<Navigate to="/positions" replace />} />
          <Route path="/positions" element={<PositionListPage />} />
          <Route path="/positions/new" element={<PositionFormPage mode="create" />} />
          <Route path="/positions/:id/edit" element={<PositionFormPage mode="edit" />} />
          <Route path="/import" element={<UploadPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="*" element={<Navigate to="/positions" replace />} />
        </Routes>
      </main>
    </div>
  );
}
