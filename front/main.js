/* Nova 商城 · 首页逻辑
 * 商品数据来自 GET /api/products；购物车由 cart.js 统一管理并在页面间共享。
 */
const API_BASE = "/api";

const state = {
  products: [],
};

/* ---------- 工具 ---------- */
const $ = (sel) => document.querySelector(sel);

function escapeHtml(value) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(value ?? "").replace(/[&<>"']/g, (ch) => map[ch]);
}

// 图片加载失败时的本地兜底（SVG 渐变占位图），保证演示不出现破图
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

function bindImageFallback(img, category) {
  img.addEventListener(
    "error",
    () => {
      img.src = placeholderImg(category || "Nova");
    },
    { once: true }
  );
}

/* ---------- 商品：获取与渲染 ---------- */
async function fetchProducts({ keyword = "", category = "" } = {}) {
  const params = new URLSearchParams();
  if (keyword) params.set("keyword", keyword);
  if (category) params.set("category", category);

  const res = await fetch(`${API_BASE}/products?${params.toString()}`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.code !== 0) {
    throw new Error(body.message || `HTTP ${res.status}`);
  }
  return Array.isArray(body.data) ? body.data : [];
}

function renderProducts(list) {
  const grid = $("#productGrid");
  grid.innerHTML = "";

  list.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.id = String(p.id);
    card.innerHTML = `
      <button class="thumb" type="button" aria-label="查看 ${escapeHtml(p.name)} 详情">
        <img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.name)}" loading="lazy">
      </button>
      <div class="info">
        <span class="cat">${escapeHtml(p.category)}</span>
        <button class="name" type="button" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</button>
        <div class="desc">${escapeHtml(p.description || "")}</div>
        <div class="row">
          <span class="price">${Number(p.price).toFixed(2)}</span>
          <button class="add-btn" data-id="${Number(p.id)}">加入购物车</button>
        </div>
      </div>`;
    bindImageFallback(card.querySelector("img"), p.category);
    grid.appendChild(card);
  });
}

async function loadAndRender({ keyword = "", category = "" } = {}) {
  $("#sectionSub").textContent = "正在加载商品…";
  $("#emptyState").hidden = true;
  $("#errorState").hidden = true;

  try {
    state.products = await fetchProducts({ keyword, category });
    renderProducts(state.products);
    $("#emptyState").hidden = state.products.length > 0;
    $("#sectionSub").textContent = "精选科技好物";
  } catch (err) {
    console.error("加载商品失败：", err);
    state.products = [];
    renderProducts([]);
    $("#sectionSub").textContent = "加载失败";
    $("#errorState").hidden = false;
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

/* ---------- 地址栏筛选（供详情页导航回首页使用） ---------- */
function applyInitialFilters() {
  const params = new URLSearchParams(window.location.search);
  const keyword = (params.get("keyword") || "").trim();
  const category = (params.get("category") || "").trim();

  if (keyword) $("#searchInput").value = keyword;

  if (category) {
    document.querySelectorAll("#navLinks a").forEach((a) => {
      a.classList.toggle("active", a.dataset.category === category);
    });
    $("#sectionTitle").textContent = category;
  }

  return { keyword, category };
}

/* ---------- 事件绑定 ---------- */
function bindEvents() {
  // 加购按钮直接加购；点击卡片其余区域进入独立详情页
  $("#productGrid").addEventListener("click", (e) => {
    const btn = e.target.closest(".add-btn");
    if (btn) {
      const product = state.products.find((p) => p.id === Number(btn.dataset.id));
      if (product) NovaCart.add(product, { open: true });
      return;
    }

    const card = e.target.closest(".product-card[data-id]");
    if (card) {
      window.location.href = `detail.html?id=${encodeURIComponent(card.dataset.id)}`;
    }
  });

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
}

/* ---------- 初始化 ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initHero();
  bindEvents();
  const initialFilters = applyInitialFilters();
  loadAndRender(initialFilters);
});
