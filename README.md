# 招聘岗位管理系统

招聘岗位管理系统是一个面向人事招聘场景的全栈 Web 项目，用于统一维护招聘岗位、处理岗位审批、批量导入岗位信息并查看岗位状态统计。项目采用前后端分离架构：前端使用 React + Vite + TailwindCSS + shadcn 风格组件，后端使用 Node.js + Express + TypeScript，数据库使用 MySQL，并通过 Docker Compose 提供本地数据库环境。

## 功能介绍

- 岗位管理：支持岗位新增、编辑、删除、详情查看、关键词搜索和状态筛选。
- Excel 批量导入：支持上传 `.xlsx/.xls` 文件，按行导入岗位并返回失败行原因。
- 审批流程：岗位可从草稿提交审批，审批人可通过或驳回。
- 生命周期管理：岗位状态包括草稿、待审批、已驳回、已发布、已关闭。
- 统计看板：展示岗位总数和不同状态下的岗位数量。
- 角色视图：前端模拟招聘管理员、审批人、访客三种角色，不同角色看到不同入口和操作。

## 技术栈

- 前端：React 19、Vite、TypeScript、TailwindCSS、shadcn 风格组件、React Router、TanStack Query、React Hook Form、Zod、Recharts。
- 后端：Node.js、Express、TypeScript、mysql2、multer、xlsx、zod、Vitest、Supertest。
- 数据库：MySQL 8，通过 Docker Compose 启动。
- 包管理：pnpm workspace。

## 项目结构

```text
.
├── backend
│   ├── src
│   │   ├── app.ts                  # Express 应用装配
│   │   ├── server.ts               # 服务启动入口，启动时执行数据库建表
│   │   ├── config                  # 环境变量配置
│   │   ├── db                      # MySQL 连接池与建表脚本
│   │   ├── middleware              # 统一错误处理
│   │   ├── positions               # 岗位路由、业务服务、仓储实现
│   │   ├── types                   # 岗位类型定义
│   │   └── utils                   # 统一响应和业务错误
│   └── tests                       # 后端接口测试
├── frontend
│   ├── src
│   │   ├── components/ui           # shadcn 风格基础组件
│   │   ├── lib                     # API 客户端、角色上下文、工具函数
│   │   ├── pages                   # 岗位列表、表单、导入、统计页面
│   │   ├── types                   # 前端类型定义
│   │   ├── App.tsx                 # 路由和整体布局
│   │   └── main.tsx                # 前端入口
│   └── vite.config.ts              # Vite 配置与后端代理
├── templates
│   └── 岗位信息模板.xlsx            # Excel 导入模板
├── docker-compose.yml              # MySQL 本地环境
├── package.json                    # 根项目脚本
└── pnpm-workspace.yaml             # pnpm workspace 配置
```

## 启动方式

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动 MySQL

```bash
docker compose up -d mysql
```

默认数据库配置如下：

```text
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=hirement
DB_PASSWORD=hirement_password
DB_NAME=hirement
```

### 3. 配置后端环境变量

```bash
cp backend/.env.example backend/.env
```

如本机 3306 端口已被占用，可修改 `docker-compose.yml` 的端口映射，并同步修改 `backend/.env`。

### 4. 启动后端

```bash
pnpm --filter backend dev
```

后端默认运行在：

```text
http://localhost:3001/webapi
```

启动时会自动创建 `positions` 表。

### 5. 启动前端

```bash
pnpm --filter frontend dev
```

前端默认运行在：

```text
http://localhost:5173
```

前端开发服务器会把 `/webapi` 请求代理到后端。

## 使用说明

### 角色切换

页面右上角可以切换模拟角色：

- 招聘管理员：可新增、编辑、删除草稿/驳回岗位，提交审批，关闭已发布岗位，导入 Excel。
- 审批人：只看到待审批岗位，可审批通过或驳回。
- 访客：只看到已发布岗位，可查看详情和统计。

### Excel 导入

模板文件位于：

```text
templates/岗位信息模板.xlsx
```

导入文件至少需要包含以下两列：

```text
岗位名称 | 岗位描述
```

导入成功的岗位默认状态为草稿，后续可由招聘管理员提交审批。

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

- `GET /positions?keyword=&status=`：查询岗位列表。
- `GET /positions/:id`：查询岗位详情。
- `POST /positions`：创建岗位。
- `PUT /positions/:id`：更新岗位信息。
- `DELETE /positions/:id`：删除草稿或已驳回岗位。
- `POST /positions/:id/submit`：提交审批。
- `POST /positions/:id/approve`：审批通过。
- `POST /positions/:id/reject`：审批驳回。
- `POST /positions/:id/close`：关闭已发布岗位。
- `POST /positions/import`：Excel 批量导入。
- `GET /positions/stats`：岗位状态统计。

## 状态流转规则

```text
草稿 DRAFT -> 待审批 PENDING -> 已发布 PUBLISHED -> 已关闭 CLOSED
                 |
                 -> 已驳回 REJECTED -> 待审批 PENDING
```

- 新建或导入的岗位默认是草稿。
- 草稿和已驳回岗位可以提交审批、编辑和删除。
- 待审批岗位只能由审批人通过或驳回。
- 已发布岗位可以由管理员继续编辑信息，也可以关闭。
- 已发布岗位不能直接删除，需要先关闭。
- 已关闭岗位只用于历史查看，不再参与编辑和审批。

## 常用命令

```bash
pnpm test
pnpm typecheck
pnpm build
```

也可以分别执行：

```bash
pnpm --filter backend test
pnpm --filter backend dev
pnpm --filter frontend dev
```

## 项目见解

这个项目的核心不只是实现 CRUD，而是把“岗位发布”抽象成一个有状态约束的业务流程。后端通过服务层集中处理状态流转，避免前端绕过页面限制后造成非法数据；前端通过角色视图减少无关入口，让招聘管理员、审批人和访客分别只看到自己关心的功能。

本项目没有实现真实登录和鉴权，而是采用前端模拟角色。这样能在课程项目里完整展示角色差异和业务流程，同时避免账号体系、JWT、权限中间件带来的额外复杂度。如果要扩展为生产系统，下一步可以加入用户表、登录接口、JWT 鉴权和后端 RBAC 权限校验。

Excel 导入是本项目比较实用的部分。它不是简单上传文件，而是按行返回成功和失败结果，便于用户修正数据。岗位描述仍保留为文本字段，前端提示用户按“岗位职责、任职要求、加分项”分段填写，兼顾实现复杂度和业务表达能力。

## AI 辅助开发记录

本项目根据《招聘岗位管理系统需求规格说明书》拆解需求后，由 AI 辅助完成项目结构设计、后端 RESTful API、岗位生命周期规则、Excel 导入、前端管理页面、统计看板、角色视图和测试用例。开发过程中先用后端接口测试明确业务行为，再实现服务层和路由，最后补充前端交互与文档，减少重复编码并提高回归验证效率。
