# Nova 商城

Nova 是一个完整的前后端分离购物网站项目（前端面试 + AI Agent 开发考核 Demo），包含原生前端页面、Node.js 后端 API 与 MySQL 数据库。

## 技术栈

- **前端**：原生 HTML5 + CSS3 + JavaScript（无框架），Flex / Grid 布局，响应式设计
- **后端**：Node.js + Express，CORS 跨域，JSON 解析
- **数据库**：MySQL 8（`init.sql` 一键初始化，预置 20 条商品数据）
- **AI 协作**：开发过程由 AI Coding 辅助完成（见文末章节）

## 目录结构

```
Real/
├── front/              # 前端（原生 HTML/CSS/JS）
│   ├── index.html      # 商城首页（导航 / Banner / 商品网格 / 侧拉购物车）
│   ├── style.css       # 现代感样式 + 响应式媒体查询
│   └── main.js         # 页面初始化、商品渲染、购物车逻辑
├── back/               # 后端（Node.js + Express）
│   ├── server.js       # API 服务入口
│   ├── package.json
│   └── init.sql        # 数据库初始化脚本（含 20 条商品数据）
└── README.md
```

## 快速开始

### 1. 初始化数据库

```bash
mysql -u root -p < back/init.sql
```

### 2. 启动后端

```bash
cd back
npm install
npm start          # 生产模式：node server.js
# 或
npm run dev        # 开发模式：nodemon 热重载
```

服务监听 `http://localhost:3000`。

### 3. 打开前端

直接用浏览器打开 `front/index.html`，或在 `front` 目录起一个静态服务：

```bash
cd front && npx serve .
```

## API 概览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/products` | 商品列表，支持查询参数 `?keyword=&category=` |
| GET | `/api/products/:id` | 商品详情 |
| POST | `/api/orders` | 创建订单 |

> 当前后端返回模拟数据，后续将切换为 MySQL 真实查询。

## AI Coding Process

本项目由我与 AI 结对完成，我的角色是「产品经理 + 代码验收者」：

- **需求拆解**：把考核要求拆成结构化 Prompt（数据库 → 后端 API → 前端骨架 → 文档），要求 AI 分批输出，避免一次生成内容过多被截断。
- **生成与审查**：每批代码生成后，要求 AI 做语法检查与接口冒烟测试（`node --check`、curl 验证各 API），并诚实披露未验证的部分（如 init.sql 未在真实 MySQL 执行）。
- **迭代修正**：发现页面因后端未启动而空白时，指挥 AI 增加带明确删除标记的本地预览兜底数据，同时保留「商品不硬编码在前端」的考核约束。
