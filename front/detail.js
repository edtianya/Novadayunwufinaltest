/* Nova 商城 · 商品详情页
 * 从 URL 读取商品 ID，请求 GET /api/products/:id 并渲染；购物车由 cart.js 跨页面共享。
 */
const API_BASE = "/api";

const $ = (sel) => document.querySelector(sel);

const CATEGORY_TAGLINES = {
  耳机: "沉浸声场 · 主动降噪 · 全天舒适佩戴",
  键盘: "扎实手感 · 稳定连接 · 为长时间输入而生",
  台灯: "舒适照度 · 无频闪 · 守护每一段专注时光",
  鼠标: "精准追踪 · 轻盈握持 · 高效操控每一天",
  音箱: "饱满声场 · 精致做工 · 让房间充满好声音",
  显示器: "高分辨率 · 广色域 · 为创作与娱乐呈现真实色彩",
  配件: "细节补全 · 官方适配 · 让桌面体验更完整",
};

const state = {
  product: null,
};

/* ---------- 工具 ---------- */
function placeholderImg(text) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#262a35"/><stop offset="1" stop-color="#2f6bff"/>` +
    `</linearGradient></defs>` +
    `<rect width="800" height="800" fill="url(#g)"/>` +
    `<text x="50%" y="50%" fill="#ffffff" font-size="36" text-anchor="middle" font-family="sans-serif">${text}</text>` +
    `</svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function highResImage(url) {
  return String(url || "").replace(/([?&])w=\d+/, "$1w=1600");
}

function stockStatus(stock) {
  const n = Number(stock) || 0;
  if (n <= 0) return { text: "暂时缺货", className: "out", available: false };
  if (n < 30) return { text: `仅剩 ${n} 件 · 建议尽快下单`, className: "low", available: true };
  return { text: "现货充足 · 48 小时内发货", className: "in", available: true };
}

function parseProductId() {
  const raw = new URLSearchParams(window.location.search).get("id");
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/* ---------- 图片 ---------- */
function renderImage(url, alt) {
  const media = $("#detailMedia");
  const image = $("#detailImage");
  media.classList.remove("loaded");

  image.onload = () => media.classList.add("loaded");
  image.onerror = () => {
    image.onerror = null;
    image.src = placeholderImg(state.product ? state.product.category : "Nova");
    media.classList.add("loaded");
  };
  image.src = highResImage(url) || placeholderImg("Nova");
  image.alt = alt;
}

function renderEditorialImage(url, alt) {
  const image = $("#detailEditorialImage");
  image.onerror = () => {
    image.onerror = null;
    image.src = placeholderImg("Nova");
  };
  image.src = highResImage(url) || placeholderImg("Nova");
  image.alt = alt;
}

/* ---------- 详情渲染 ---------- */
function renderDescription(description) {
  const box = $("#detailDesc");
  box.innerHTML = "";

  const lines = String(description || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const paragraphs = lines.filter((line) => !/^[•·\-*]\s*/.test(line));
  const features = lines
    .filter((line) => /^[•·\-*]\s*/.test(line))
    .map((line) => line.replace(/^[•·\-*]\s*/, ""));

  if (paragraphs.length) {
    paragraphs.forEach((text) => {
      const p = document.createElement("p");
      p.textContent = text;
      box.appendChild(p);
    });
  } else if (!features.length) {
    const p = document.createElement("p");
    p.textContent = "暂无详细介绍。";
    box.appendChild(p);
  }

  if (features.length) {
    const list = document.createElement("ul");
    list.className = "pd-feature-list";
    features.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      list.appendChild(li);
    });
    box.appendChild(list);
  }
}

function renderSpecs(product) {
  const grid = $("#specGrid");
  grid.innerHTML = "";

  const stock = stockStatus(product.stock);
  const specs = [
    ["商品编号", `NV-${String(product.id).padStart(4, "0")}`],
    ["商品分类", product.category || "未分类"],
    ["库存数量", `${Number(product.stock) || 0} 件`],
    ["库存状态", stock.text],
    ["发货时效", "付款后 48 小时内发出"],
    ["售后服务", "7 天无理由退换 · 一年官方质保"],
    ["包装清单", "Nova 官方包装 × 1"],
  ];

  specs.forEach(([label, value]) => {
    const row = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = label;
    dd.textContent = value;
    row.append(dt, dd);
    grid.appendChild(row);
  });
}

function markActiveCategory(category) {
  document.querySelectorAll("#detailNavLinks a[data-category]").forEach((a) => {
    a.classList.toggle("active", a.dataset.category === category);
  });
}

function renderProduct(product) {
  state.product = product;

  document.title = `${product.name} — Nova 商城`;

  renderImage(product.image_url, product.name);

  const categoryLink = $("#breadcrumbCategory");
  categoryLink.textContent = product.category || "全部商品";
  categoryLink.href = `index.html?category=${encodeURIComponent(product.category || "")}`;
  $("#breadcrumbName").textContent = product.name;

  $("#detailCategory").textContent = product.category || "精选好物";
  $("#detailName").textContent = product.name;
  $("#detailTagline").textContent =
    CATEGORY_TAGLINES[product.category] || "Nova 官方正品 · 精选科技好物";
  $("#detailPrice").textContent = Number(product.price).toFixed(2);

  const stock = stockStatus(product.stock);
  const stockEl = $("#detailStock");
  stockEl.textContent = stock.text;
  stockEl.className = `pd-stock ${stock.className}`;

  const addBtn = $("#detailAddBtn");
  addBtn.disabled = !stock.available;
  $("#detailAddText").textContent = stock.available ? "加入购物车" : "暂时缺货";

  renderDescription(product.description);
  renderSpecs(product);

  renderEditorialImage(product.image_url, `${product.name} 官方展示图`);
  $("#editorialCaption").textContent = `${product.category || "Nova"} · ${product.name}`;

  markActiveCategory(product.category);

  $("#detailHero").setAttribute("aria-busy", "false");
  $("#detailContent").hidden = false;
  $("#detailError").hidden = true;
}

function showError(message) {
  $("#detailHero").setAttribute("aria-busy", "false");
  $("#detailHero").hidden = true;
  $("#detailContent").hidden = true;
  $("#detailErrorText").textContent = message;
  $("#detailError").hidden = false;
  document.title = "商品不可用 — Nova 商城";
}

/* ---------- 数据请求 ---------- */
async function loadProduct() {
  const id = parseProductId();
  if (!id) {
    showError("链接中缺少有效的商品 ID，请从商品列表重新进入。");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/products/${id}`);
    const body = await res.json().catch(() => ({}));

    if (!res.ok || body.code !== 0) {
      throw new Error(body.message || `HTTP ${res.status}`);
    }
    if (!body.data) {
      throw new Error("商品数据为空");
    }

    renderProduct(body.data);
  } catch (err) {
    console.error("加载商品详情失败：", err);
    let message = "加载商品详情失败，请稍后重试。";
    if (err instanceof TypeError) {
      message = "无法连接后端服务，请确认已在 back 目录运行 npm start。";
    } else if (err.message === "商品不存在") {
      message = "这件商品不存在或已下架，请从商品列表重新选择。";
    } else if (err.message) {
      message = `加载失败：${err.message}`;
    }
    showError(message);
  }
}

/* ---------- 交互 ---------- */
function bindEvents() {
  $("#detailAddBtn").addEventListener("click", () => {
    if (!state.product) return;
    if (!stockStatus(state.product.stock).available) return;
    if (window.NovaCart) {
      window.NovaCart.add(state.product, { open: true });
    }
  });

  $("#detailSearchInput").addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const keyword = e.target.value.trim();
    window.location.href = keyword
      ? `index.html?keyword=${encodeURIComponent(keyword)}`
      : "index.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  loadProduct();
});
