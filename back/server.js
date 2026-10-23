const path = require("path");
const express = require("express");
const cors = require("cors");
const { db, dbFile } = require("./db");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

// GET /api/health  健康检查
app.get("/api/health", (req, res) => {
  try {
    db.prepare("SELECT 1 AS ok").get();
    res.json({ code: 0, data: { status: "ok", database: "sqlite" } });
  } catch (err) {
    console.error("[health] SQLite 检查失败：", err);
    res.status(503).json({ code: 503, message: "SQLite 数据库不可用" });
  }
});

// GET /api/products?keyword=&category=  商品列表
app.get("/api/products", (req, res, next) => {
  try {
    const keyword = String(req.query.keyword ?? "").trim();
    const category = String(req.query.category ?? "").trim();
    const conditions = [];
    const params = [];

    if (keyword) {
      conditions.push("(name LIKE ? OR description LIKE ?)");
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (category) {
      conditions.push("category = ?");
      params.push(category);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = db
      .prepare(
        `SELECT id, name, price, category, image_url, description, stock
         FROM products
         ${where}
         ORDER BY id ASC`
      )
      .all(...params);

    res.json({ code: 0, data: rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id  商品详情
app.get("/api/products/:id", (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ code: 400, message: "商品 ID 不合法" });
  }

  try {
    const row = db
      .prepare(
        `SELECT id, name, price, category, image_url, description, stock
         FROM products WHERE id = ?`
      )
      .get(id);

    if (!row) {
      return res.status(404).json({ code: 404, message: "商品不存在" });
    }
    res.json({ code: 0, data: row });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders  创建订单（服务端计价，事务内校验并扣减库存）
app.post("/api/orders", (req, res, next) => {
  const { items, receiver } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ code: 400, message: "订单商品不能为空" });
  }

  const merged = new Map();
  for (const raw of items) {
    const id = Number(raw?.id);
    const qty = Number(raw?.qty);
    if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ code: 400, message: "商品参数不合法" });
    }
    merged.set(id, (merged.get(id) || 0) + qty);
  }

  const entries = [...merged.entries()].sort((a, b) => a[0] - b[0]);
  const receiverInfo =
    receiver && typeof receiver === "object"
      ? {
          name: String(receiver.name ?? "").trim(),
          phone: String(receiver.phone ?? "").trim(),
          address: String(receiver.address ?? "").trim(),
        }
      : null;

  const rollback = () => {
    try {
      db.exec("ROLLBACK");
    } catch (err) {
      // 没有活动事务时忽略
    }
  };

  try {
    db.exec("BEGIN IMMEDIATE");

    const ids = entries.map(([id]) => id);
    const placeholders = ids.map(() => "?").join(", ");
    const products = db
      .prepare(`SELECT id, name, price, stock FROM products WHERE id IN (${placeholders})`)
      .all(...ids);
    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalPrice = 0;
    for (const [id, qty] of entries) {
      const product = productMap.get(id);
      if (!product) {
        rollback();
        return res.status(404).json({ code: 404, message: `商品 ${id} 不存在或已下架` });
      }
      if (product.stock < qty) {
        rollback();
        return res.status(409).json({ code: 409, message: `「${product.name}」库存不足` });
      }
      totalPrice += Number(product.price) * qty;
    }
    totalPrice = Math.round(totalPrice * 100) / 100;

    const orderNo = `NOVA${Date.now()}${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
    const status = "pending";

    db.prepare(
      `INSERT INTO orders
         (order_no, total_price, status, receiver_name, receiver_phone, receiver_address)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      orderNo,
      totalPrice,
      status,
      receiverInfo?.name || null,
      receiverInfo?.phone || null,
      receiverInfo?.address || null
    );

    const updateStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
    for (const [id, qty] of entries) {
      updateStock.run(qty, id);
    }

    db.exec("COMMIT");

    res.status(201).json({
      code: 0,
      message: "下单成功",
      data: { order_no: orderNo, total_price: totalPrice, status },
    });
  } catch (err) {
    rollback();
    next(err);
  }
});

app.use("/api", (req, res) => {
  res.status(404).json({ code: 404, message: "接口不存在" });
});

// 后端同时托管前端静态页面，启动后可直接访问 http://localhost:3000
app.use(express.static(path.join(__dirname, "..", "front")));

app.use((err, req, res, next) => {
  console.error("[server] 请求处理失败：", err);
  res.status(500).json({
    code: 500,
    message: "服务器内部错误，请查看后端终端日志",
  });
});

app.listen(PORT, () => {
  const productCount = Number(
    db.prepare("SELECT COUNT(*) AS count FROM products").get().count
  );
  console.log(`Nova API server running at http://localhost:${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}/`);
  console.log(`SQLite: ${dbFile}（${productCount} 个商品）`);
});
