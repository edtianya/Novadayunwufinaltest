/* Nova 商城 · 页面逻辑
 * 商品首选后端 API；后端未启动时回退到 MOCK_PRODUCTS 本地预览
 * 考核要求「商品不能硬编码在前端」：联调完成后删除 MOCK_PRODUCTS 及 loadAndRender 中的兜底分支
 */
const API_BASE = "http://localhost:3000/api";

const state = {
  products: [],
  cart: new Map(), // productId -> { product, qty }
};

/* ---------- 本地预览数据（临时，联调后删除） ----------
 * 仅在后端未启动时兜底渲染，让页面可以独立预览；
 * 字段名与数据库 products 表保持一致。
 * 商品图来自 Unsplash（Unsplash License，免费可商用）
 */
const MOCK_PRODUCTS = [
  { id: 1, name: "NovaBeat Q45 头戴式主动降噪耳机", price: 899, category: "耳机", image_url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80", description: "自适应主动降噪，45 小时超长续航。", stock: 120 },
  { id: 2, name: "NovaBeat Air 真无线降噪耳机", price: 399, category: "耳机", image_url: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=600&q=80", description: "蓝牙 5.4 低延迟连接，通话三麦克风降噪。", stock: 200 },
  { id: 5, name: "NovaKey K87 机械键盘（Gasket 结构）", price: 349, category: "键盘", image_url: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80", description: "Gasket 全键无冲，五层填充消音。", stock: 150 },
  { id: 9, name: "NovaLight L1 AA 级护眼台灯", price: 199, category: "台灯", image_url: "https://images.unsplash.com/photo-1774647001992-b711ae72f83d?auto=format&fit=crop&w=600&q=80", description: "国 AA 级照度，无频闪无蓝光危害。", stock: 220 },
  { id: 12, name: "NovaGlide M1 无线静音鼠标", price: 89, category: "鼠标", image_url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80", description: "静音微动不扰人，18 个月超长电池续航。", stock: 400 },
  { id: 18, name: "NovaView V27 27 英寸 4K 显示器", price: 1899, category: "显示器", image_url: "https://images.unsplash.com/photo-1666771410140-0573b232426e?auto=format&fit=crop&w=600&q=80", description: "27 英寸 4K IPS 面板，Type-C 65W 反向供电。", stock: 75 },
];

/* ---------- 工具 ---------- */
const $ = (sel) => document.querySelector(sel);

// 图片加载失败时的本地兜底（SVG 渐变占位图），保证离线演示可用
function placeholderImg(text) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#262a35"/><stop offset="1" stop-color="#2f6bff"/>` +
    `</linearGradient></defs>` +
    `<rect width="600" height="600" fill="url(#g)"/>` +
    `<text x="50%" y="50%" fill="#ffffff" font-size="30" text-anchor="middle" font-family="sans-serif">${text}</text>` +
    `</svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function formatPrice(n) {
  return "¥" + Number(n).toFixed(2);
}

/* ---------- 商品：获取与渲染 ---------- */
async function fetchProducts({ keyword = "", category = "" } = {}) {
  const params = new URLSearchParams();
  if (keyword) params.set("keyword", keyword);
  if (category) params.set("category", category);

  const res = await fetch(`${API_BASE}/products?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  return body.data || [];
}

function renderProducts(list) {
  const grid = $("#productGrid");
  const empty = $("#emptyState");
  grid.innerHTML = "";
  empty.hidden = list.length > 0;

  list.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="thumb">
        <img src="${p.image_url}" alt="${p.name}" loading="lazy"
             onerror="this.onerror=null;this.src=placeholderImg('${p.category}')">
      </div>
      <div class="info">
        <span class="cat">${p.category}</span>
        <div class="name" title="${p.name}">${p.name}</div>
        <div class="desc">${p.description || ""}</div>
        <div class="row">
          <span class="price">${Number(p.price).toFixed(2)}</span>
          <button class="add-btn" data-id="${p.id}">加入购物车</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

async function loadAndRender({ keyword = "", category = "" } = {}) {
  try {
    state.products = await fetchProducts({ keyword, category });
    $("#sectionSub").textContent = "精选科技好物";
  } catch (err) {
    // 后端未启动：回退到本地预览数据（联调后删除本分支）
    console.warn("后端未连接，回退到本地预览数据：", err.message);
    state.products = MOCK_PRODUCTS.filter(
      (p) =>
        (!category || p.category === category) &&
        (!keyword || p.name.includes(keyword) || (p.description || "").includes(keyword))
    );
    $("#sectionSub").textContent = "后端未连接 · 当前为本地预览数据";
  }
  renderProducts(state.products);
}

/* ---------- 侧拉购物车 ---------- */
function openCart() {
  $("#cartDrawer").classList.add("open");
  $("#cartMask").classList.add("open");
}

function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#cartMask").classList.remove("open");
}

function cartCount() {
  let n = 0;
  state.cart.forEach((item) => (n += item.qty));
  return n;
}

function cartTotal() {
  let total = 0;
  state.cart.forEach((item) => (total += item.qty * item.product.price));
  return total;
}

function addToCart(id) {
  const product = state.products.find((p) => p.id === id);
  if (!product) return;
  const entry = state.cart.get(id);
  if (entry) {
    entry.qty += 1;
  } else {
    state.cart.set(id, { product, qty: 1 });
  }
  renderCart();
  openCart();
}

function changeQty(id, delta) {
  const entry = state.cart.get(id);
  if (!entry) return;
  entry.qty += delta;
  if (entry.qty <= 0) state.cart.delete(id);
  renderCart();
}

function removeFromCart(id) {
  state.cart.delete(id);
  renderCart();
}

function renderCart() {
  const box = $("#cartItems");
  box.innerHTML = "";

  if (state.cart.size === 0) {
    box.innerHTML = `<div class="cart-empty">购物车还是空的，去挑点好物吧～</div>`;
  } else {
    state.cart.forEach((item, id) => {
      const p = item.product;
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <img src="${p.image_url}" alt="${p.name}"
             onerror="this.onerror=null;this.src=placeholderImg('${p.category}')">
        <div class="meta">
          <div class="name" title="${p.name}">${p.name}</div>
          <div class="unit">${formatPrice(p.price)}</div>
          <div class="qty-row">
            <button class="qty-btn" data-act="minus" data-id="${id}">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" data-act="plus" data-id="${id}">+</button>
            <button class="remove" data-act="remove" data-id="${id}">删除</button>
          </div>
        </div>`;
      box.appendChild(row);
    });
  }

  $("#navCartBadge").textContent = cartCount();
  $("#drawerCartCount").textContent = cartCount();
  $("#cartTotal").textContent = formatPrice(cartTotal());
}

/* ---------- 下单 ---------- */
async function checkout() {
  if (state.cart.size === 0) {
    alert("购物车是空的，先添加商品再结算吧～");
    return;
  }
  const items = [];
  state.cart.forEach((item, id) => items.push({ id, qty: item.qty }));

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        total_price: cartTotal(),
        receiver: { name: "", phone: "", address: "" }, // 结算表单后续补充
      }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || `HTTP ${res.status}`);

    alert(`下单成功！订单号：${body.data.order_no}`);
    state.cart.clear();
    renderCart();
    closeCart();
  } catch (err) {
    console.error("创建订单失败：", err);
    alert("下单失败，请稍后重试");
  }
}

/* ---------- Hero 轮播 ---------- */
function initHero() {
  const slides = document.querySelectorAll(".hero-slide");
  const dotsBox = $("#heroDots");
  let index = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.addEventListener("click", () => show(i));
    dotsBox.appendChild(dot);
  });
  const dots = dotsBox.querySelectorAll("button");

  function show(i) {
    slides[index].classList.remove("active");
    dots[index].classList.remove("active");
    index = i;
    slides[index].classList.add("active");
    dots[index].classList.add("active");
  }

  show(0);
  setInterval(() => show((index + 1) % slides.length), 5000);
}

/* ---------- 事件绑定 ---------- */
function bindEvents() {
  // 加入购物车（事件委托）
  $("#productGrid").addEventListener("click", (e) => {
    const btn = e.target.closest(".add-btn");
    if (btn) addToCart(Number(btn.dataset.id));
  });

  // 购物车条目操作（事件委托）
  $("#cartItems").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.act === "plus") changeQty(id, 1);
    if (btn.dataset.act === "minus") changeQty(id, -1);
    if (btn.dataset.act === "remove") removeFromCart(id);
  });

  // 抽屉开关
  $("#cartOpenBtn").addEventListener("click", openCart);
  $("#cartCloseBtn").addEventListener("click", closeCart);
  $("#cartMask").addEventListener("click", closeCart);
  $("#checkoutBtn").addEventListener("click", checkout);

  // 分类导航
  $("#navLinks").addEventListener("click", (e) => {
    const link = e.target.closest("a[data-category]");
    if (!link) return;
    e.preventDefault();
    document.querySelectorAll("#navLinks a").forEach((a) => a.classList.remove("active"));
    link.classList.add("active");
    $("#sectionTitle").textContent = link.textContent === "全部" ? "为你推荐" : link.textContent;
    loadAndRender({ category: link.dataset.category });
  });

  // 搜索（回车触发）
  $("#searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      loadAndRender({ keyword: e.target.value.trim() });
    }
  });

  // ESC 关闭抽屉
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCart();
  });
}

/* ---------- 初始化 ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initHero();
  bindEvents();
  renderCart();
  loadAndRender();
});
