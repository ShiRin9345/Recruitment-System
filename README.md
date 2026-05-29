# 招聘岗位管理系统

一个基于 React + Vite + TailwindCSS + shadcn 风格组件、Node.js + Express、MySQL + Docker 的招聘岗位管理系统。

## 功能

- 岗位增删改查
- 岗位名称搜索与状态筛选
- Excel 批量导入岗位
- 岗位状态流转：草稿、待审批、已驳回、已发布、已关闭
- 审批通过、驳回、发布后关闭
- 按状态统计岗位数量
- 前端模拟角色：招聘管理员、审批人、访客

## 项目结构

```text
.
├── backend
│   ├── src
│   └── tests
├── frontend
│   └── src
├── docker-compose.yml
├── package.json
└── pnpm-workspace.yaml
```

## 快速启动

安装依赖：

```bash
pnpm install
```

启动 MySQL：

```bash
docker compose up -d mysql
```

复制后端环境变量：

```bash
cp backend/.env.example backend/.env
```

启动后端：

```bash
pnpm --filter backend dev
```

启动前端：

```bash
pnpm --filter frontend dev
```

访问前端：

```text
http://localhost:5173
```

后端默认地址：

```text
http://localhost:3001/webapi
```

## Excel 模板

Excel 第一行至少包含以下列名：

```text
岗位名称 | 岗位描述
```

导入后的岗位默认状态为草稿。

## 常用命令

```bash
pnpm test
pnpm typecheck
pnpm build
```

## API 概览

所有接口统一返回：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

基础路径为 `/webapi`：

- `GET /positions?keyword=&status=`
- `GET /positions/:id`
- `POST /positions`
- `PUT /positions/:id`
- `DELETE /positions/:id`
- `POST /positions/:id/submit`
- `POST /positions/:id/approve`
- `POST /positions/:id/reject`
- `POST /positions/:id/close`
- `POST /positions/import`
- `GET /positions/stats`

## AI 辅助开发记录

本项目根据《招聘岗位管理系统需求规格说明书》拆解需求后，由 AI 辅助完成项目结构设计、后端 RESTful API、岗位生命周期规则、Excel 导入、前端管理页面、统计看板和测试用例。开发过程中采用先定义后端行为测试、再实现服务与接口的方式，减少手工重复编码。
