import type { ApiResponse, ImportResult, Position, PositionFormValues, PositionStats, PositionStatus } from "@/types/position";

const parseResponse = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || payload.code !== 200) {
    throw new Error(payload.message || "请求失败");
  }
  return payload.data;
};

export const positionsApi = {
  async list(filters: { keyword?: string; status?: PositionStatus | "ALL" }) {
    const params = new URLSearchParams();
    if (filters.keyword?.trim()) {
      params.set("keyword", filters.keyword.trim());
    }
    if (filters.status && filters.status !== "ALL") {
      params.set("status", filters.status);
    }
    const query = params.toString();
    const response = await fetch(`/webapi/positions${query ? `?${query}` : ""}`);
    return parseResponse<Position[]>(response);
  },

  async detail(id: number) {
    const response = await fetch(`/webapi/positions/${id}`);
    return parseResponse<Position>(response);
  },

  async create(values: PositionFormValues) {
    const response = await fetch("/webapi/positions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    return parseResponse<Position>(response);
  },

  async update(id: number, values: PositionFormValues) {
    const response = await fetch(`/webapi/positions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    return parseResponse<Position>(response);
  },

  async remove(id: number) {
    const response = await fetch(`/webapi/positions/${id}`, { method: "DELETE" });
    return parseResponse<null>(response);
  },

  async submit(id: number) {
    const response = await fetch(`/webapi/positions/${id}/submit`, { method: "POST" });
    return parseResponse<Position>(response);
  },

  async approve(id: number) {
    const response = await fetch(`/webapi/positions/${id}/approve`, { method: "POST" });
    return parseResponse<Position>(response);
  },

  async reject(id: number, comment: string) {
    const response = await fetch(`/webapi/positions/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment })
    });
    return parseResponse<Position>(response);
  },

  async close(id: number) {
    const response = await fetch(`/webapi/positions/${id}/close`, { method: "POST" });
    return parseResponse<Position>(response);
  },

  async import(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/webapi/positions/import", {
      method: "POST",
      body: formData
    });
    return parseResponse<ImportResult>(response);
  },

  async stats() {
    const response = await fetch("/webapi/positions/stats");
    return parseResponse<PositionStats>(response);
  }
};
