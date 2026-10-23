# Nova 商城

Nova 是一个前后端分离的购物网站 Demo（前端面试 + AI Agent 开发考核）。前端使用原生 HTML/CSS/JS，后端使用 Node.js + Express，数据库使用 **SQLite**。

不需要安装 MySQL，不需要配置数据库密码。第一次启动后端时，会自动在 `back` 文件夹生成 `nova.sqlite`，并把 `back/init.sql` 里的 20 条商品导入进去。

## 技术栈

- **前端**：原生 HTML5 + CSS3 + JavaScript（无框架），响应式布局
- **后端**：Node.js 24 + Express 4 + cors
- **数据库**：SQLite，使用 Node.js 内置的 `node:sqlite`，无需安装 `sqlite3` / `better-sqlite3` / MySQL
- **数据库文件**：`back/nova.sqlite`（首次启动自动创建）

## 目录结构

```
D:\Real
├── front/                  # 前端页面（原生 HTML / CSS / JS）
│   ├── index.html          # 首页（商品列表 + 购物车抽屉）
│   ├── detail.html         # 独立商品详情页
│   ├── style.css           # 首页与两页共用的公共样式
│   ├── detail.css          # 详情页专属样式
│   ├── cart.js             # 跨页面购物车（localStorage）
│   ├── main.js             # 首页逻辑
│   └── detail.js           # 详情页逻辑（解析 URL ID + 请求详情接口）
├── back/                   # 所有后端内容都在这里
│   ├── server.js           # Express 服务与 API
│   ├── db.js               # 打开 SQLite 并自动执行 init.sql
│   ├── init.sql            # 建表 + 20 条商品数据
│   ├── nova.sqlite         # 本地数据库（自动生成，已被 git 忽略）
│   ├── package.json
│   └── package-lock.json
├── .gitignore
└── README.md
```

> 后端代码、依赖配置、数据库文件全部在 `back` 文件夹内，没有写入 `front`。



在浏览器地址栏输入：

```
http://localhost:3000
```

- 商品列表应显示 20 件商品。
- 点击商品图片或名称会进入独立详情页（地址形如 `detail.html?id=1`）：第一屏为左图右文，向下滚动可查看详细介绍与规格参数。
- 详情页与首页共用同一个购物车：加购后右上角角标立即更新，点击角标打开同一个侧拉购物车；返回首页或刷新后数量仍然保留。
- 加入购物车后点击「去结算」，会提示下单成功并返回订单号。
- 后端同时托管了前端页面，不需要另外启动前端服务，也不用双击 `index.html`。


## 验证服务是否正常

1. 浏览器打开 `http://localhost:3000/api/health`，应返回：

```json
{"code":0,"data":{"status":"ok","database":"sqlite"}}
```

2. 打开 `http://localhost:3000/api/products`，应返回 `code: 0` 和 20 条商品数据。
3. 在首页加入购物车并结算，提示「下单成功」即表示写入 SQLite 成功。

## 商品详情页与跨页面购物车

### 页面跳转与数据加载

1. 打开 `http://localhost:3000`，点击任意商品卡片（图片或名称区域，不是「加入购物车」按钮），地址会变为 `http://localhost:3000/detail.html?id=1` 这类形式。
2. 详情页从 URL 取出 `id`，请求 `GET /api/products/1`，把高清大图、分类标签、名称、价格、库存状态、详细介绍和规格参数渲染出来。
3. 第一屏为左图右文并占满视口；继续向下滚动可以看到「商品详细介绍」「规格参数」「服务保障」。
4. 直接访问 `http://localhost:3000/detail.html?id=1` 也能打开同一商品；访问不存在的 ID（如 `?id=9999`）会显示「这件商品暂时不可用」并提供返回列表按钮。

可以在浏览器或终端验证详情接口：

```bash
# 正常返回
curl http://localhost:3000/api/products/1

# 商品不存在 → 404
curl http://localhost:3000/api/products/9999
```

### 跨页面购物车测试

1. 在详情页点击巨大的「加入购物车」按钮，右上角角标变为 1，并弹出侧拉购物车。
2. 点击左上角 Logo 返回首页，角标仍然是 1；点击右上角购物车图标，可以继续增减数量或删除。
3. 在首页加购后进入任意详情页，角标和抽屉中的商品保持一致。
4. 购物车数据保存在浏览器 `localStorage` 的 `nova.cart.v1`，刷新页面或关闭重开浏览器后仍然存在；清空购物车或结算成功后才会清空。
5. 结算仍调用 `POST /api/orders`，金额由后端按数据库价格重新计算，前端保存的购物车快照不会被信任。

## API 概览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/health` | 健康检查 |
| GET | `/api/products` | 商品列表，支持 `?keyword=&category=` |
| GET | `/api/products/:id` | 商品详情，不存在返回 404 |
| POST | `/api/orders` | 创建订单，写入 SQLite 并扣减库存 |

创建订单请求示例：

```http
POST /api/orders
Content-Type: application/json

{
  "items": [
    { "id": 1, "qty": 2 },
    { "id": 12, "qty": 1 }
  ]
}
```

成功响应（201）：

```json
{
  "code": 0,
  "message": "下单成功",
  "data": {
    "order_no": "NOVA17927531334084203",
    "total_price": 1887,
    "status": "pending"
  }
}
```

金额由后端按数据库中的商品价格重新计算，前端传入的价格不会被信任。订单写入与库存扣减在同一事务中完成。

## 常见问题

### 页面显示「加载失败：无法连接服务器」

说明后端没有运行，或启动后终端被关闭了。

- 回到终端，确认能看到 `Nova API server running at http://localhost:3000`。
- 如果终端已关闭，重新执行 `cd D:\Real\back` 和 `npm start`。
- 再访问 `http://localhost:3000/api/health` 确认服务正常。

### 提示 `node` 或 `npm` 不是内部或外部命令

Node.js 未安装或没有加入系统 PATH。安装 Node.js 24 LTS 后，关闭终端重新打开，再执行 `node -v` 检查。

### 提示 `No such built-in module: node:sqlite`

Node.js 版本太旧。执行 `node -v`，如果不是 v24.x，请升级到 Node.js 24。

### 端口 3000 被占用（`EADDRINUSE`）

通常是有另一个旧的后端还在运行。先找到原来运行 `npm start` 的终端，按 `Ctrl + C`。

如果找不到，可以在 PowerShell / CMD 中查看占用进程：

```bat
netstat -ano | findstr :3000
```

最后一列是进程 PID，再执行：

```bat
taskkill /PID 进程号 /F
```

把「进程号」替换成实际数字。只结束确认属于本项目的 Node 进程。

### 提示 `Cannot find module 'express'`

说明依赖没有安装，或者命令执行目录不对。确认终端位于 `D:\Real\back`，然后执行：

```bash
npm install
npm start
```

### 商品图片显示不出来？

商品图使用 Unsplash / Pexels 的 CDN 直链，需要联网加载。若个别图片加载失败，页面会显示内置的占位图标；检查网络后刷新即可。

### 下单后数据会丢吗？

不会。数据保存在 `back/nova.sqlite`，停止服务或重启电脑后仍然存在。只有手动删除该文件才会恢复初始状态。

## 安全与数据说明

- 本项目不需要数据库密码，也没有 `.env` 或任何账号密钥。
- SQLite 数据库文件只保存在本地，`.gitignore` 已忽略 `*.sqlite`，不会误传到公开仓库。
- 订单金额由服务端计算，库存扣减使用事务，避免客户端篡改价格或超卖。
- CORS 目前为方便本地演示允许全部来源；正式上线时应限制允许的域名。

## AI Coding Process

本项目由我与 AI 结对完成，我的角色是「产品经理 + 代码验收者」：

- **环境适配**：最初后端使用 MySQL，但本机没有安装 MySQL，无法启动演示。于是改用 Node.js 24 内置的 SQLite，无需额外安装数据库，后端代码、依赖和数据库文件仍全部放在 `back`。
- **自动初始化**：`db.js` 在启动时创建 `back/nova.sqlite` 并自动执行 `init.sql`；使用 `INSERT OR IGNORE`，保证重复启动不会重复插入商品，也不会清空订单。
- **前端保持独立**：前后端分层清晰，后端代码、依赖和数据库全部位于 `back`，`front` 只负责页面展示，通过 `fetch` 调用 `/api/products` 和 `/api/orders`。
- **视觉优化**：将 20 条商品图全部替换为 Unsplash / Pexels 的真实数码产品直链，并同步更新已有 SQLite 记录（保留订单与库存）；首页 Banner 改为左侧文案 + 右侧产品图的布局，叠加暗色渐变遮罩并新增 CTA 按钮。
- **商品详情页**：按考核文档改为独立整屏页面 `detail.html`，首页点击卡片跳转到 `detail.html?id=商品ID`；`detail.js` 解析 URL 参数并调用 `GET /api/products/:id`，渲染高清大图、分类、价格、库存、详细介绍与规格参数，下方可继续滚动查看图文详情。详情页顶部导航、购物车抽屉与首页保持一致。
- **跨页面购物车**：抽出 `cart.js`，用 `localStorage`（键名 `nova.cart.v1`）持久化购物车快照，并在 `storage` / `pageshow` 事件时重新读取；首页与详情页共用同一套角标、抽屉、数量增减和结算逻辑，因此跳转或刷新后购物车状态不会丢失。结算金额仍由后端按数据库价格重新计算。
- **实测验证**：完成 20 条商品读取、关键词/分类筛选、详情接口 200/404、首页到详情页跳转、详情页加购与跨页面购物车同步、下单 201、金额计算（1887 元）、库存扣减、库存不足 409、重启后数据持久化，并在浏览器中真实点击完成了一次下单。
- **边界说明**：商品图依赖第三方 CDN，离线时会显示占位兜底；本项目是本地单机 Demo，未做多用户并发压力测试。
