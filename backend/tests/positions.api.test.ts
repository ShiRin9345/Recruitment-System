import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { InMemoryPositionRepository } from "../src/positions/inMemoryPositionRepository.js";
import { PositionService } from "../src/positions/service.js";

const createTestApp = () => {
  const repository = new InMemoryPositionRepository();
  const service = new PositionService(repository);
  return createApp({ positionService: service });
};

describe("positions API", () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    app = createTestApp();
  });

  it("creates and lists draft positions with the unified response shape", async () => {
    const createResponse = await request(app)
      .post("/webapi/positions")
      .send({ title: "前端开发实习生", description: "岗位职责：开发页面。任职要求：熟悉 React。" })
      .expect(201);

    expect(createResponse.body).toMatchObject({
      code: 200,
      message: "success",
      data: {
        id: 1,
        title: "前端开发实习生",
        status: "DRAFT"
      }
    });

    const listResponse = await request(app).get("/webapi/positions").expect(200);

    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.data[0]).toMatchObject({
      id: 1,
      title: "前端开发实习生",
      status: "DRAFT"
    });
  });

  it("supports keyword and status filters", async () => {
    await request(app)
      .post("/webapi/positions")
      .send({ title: "Java 后端开发实习生", description: "负责接口开发" });
    await request(app)
      .post("/webapi/positions")
      .send({ title: "产品经理实习生", description: "负责需求分析" });
    await request(app).post("/webapi/positions/1/submit").expect(200);

    const response = await request(app)
      .get("/webapi/positions")
      .query({ keyword: "Java", status: "PENDING" })
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      title: "Java 后端开发实习生",
      status: "PENDING"
    });
  });

  it("enforces lifecycle operations and blocks invalid edits", async () => {
    await request(app)
      .post("/webapi/positions")
      .send({ title: "测试开发实习生", description: "负责自动化测试" });

    await request(app).post("/webapi/positions/1/submit").expect(200);

    await request(app)
      .put("/webapi/positions/1")
      .send({ title: "测试开发工程师", description: "修改描述" })
      .expect(409);

    await request(app)
      .post("/webapi/positions/1/reject")
      .send({ comment: "岗位描述不够完整" })
      .expect(200);

    await request(app)
      .put("/webapi/positions/1")
      .send({ title: "测试开发实习生", description: "负责自动化测试与质量平台" })
      .expect(200);

    await request(app).post("/webapi/positions/1/submit").expect(200);
    await request(app).post("/webapi/positions/1/approve").expect(200);
    await request(app).delete("/webapi/positions/1").expect(409);
    await request(app).post("/webapi/positions/1/close").expect(200);

    const detailResponse = await request(app).get("/webapi/positions/1").expect(200);
    expect(detailResponse.body.data.status).toBe("CLOSED");
  });

  it("imports Excel rows and returns row-level errors", async () => {
    const XLSX = await import("xlsx");
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([
      { 岗位名称: "Node.js 后端实习生", 岗位描述: "负责 Express API" },
      { 岗位名称: "", 岗位描述: "缺少名称" },
      { 岗位名称: "运营实习生", 岗位描述: "" }
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, "岗位");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    const response = await request(app)
      .post("/webapi/positions/import")
      .attach("file", buffer, "positions.xlsx")
      .expect(200);

    expect(response.body.data).toEqual({
      imported: 1,
      failed: 2,
      errors: [
        { rowNumber: 3, message: "岗位名称不能为空" },
        { rowNumber: 4, message: "岗位描述不能为空" }
      ]
    });

    const listResponse = await request(app).get("/webapi/positions").expect(200);
    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.data[0].status).toBe("DRAFT");
  });

  it("returns statistics grouped by status", async () => {
    await request(app)
      .post("/webapi/positions")
      .send({ title: "Java 实习生", description: "后端开发" });
    await request(app)
      .post("/webapi/positions")
      .send({ title: "React 实习生", description: "前端开发" });
    await request(app).post("/webapi/positions/1/submit").expect(200);
    await request(app).post("/webapi/positions/1/approve").expect(200);

    const response = await request(app).get("/webapi/positions/stats").expect(200);

    expect(response.body.data).toEqual({
      total: 2,
      byStatus: {
        DRAFT: 1,
        PENDING: 0,
        REJECTED: 0,
        PUBLISHED: 1,
        CLOSED: 0
      }
    });
  });
});
