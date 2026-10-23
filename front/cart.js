/* Nova 商城 · 跨页面购物车
 * 使用 localStorage 持久化，index.html 与 detail.html 共用同一份数据与抽屉交互。
 */
(function () {
  const STORAGE_KEY = "nova.cart.v1";
  const API_BASE = "/api";

  const $ = (sel) => document.querySelector(sel);

  function escapeHtml(value) {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(value ?? "").replace(/[&<>"']/g, (ch) => map[ch]);
  }

  function formatPrice(value) {
    return "¥" + Number(value).toFixed(2);
  }

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

  function normalizeProduct(raw) {
    const product = raw || {};
    const id = Number(product.id);
    if (!Number.isInteger(id) || id <= 0) return null;
    const stock = Number(product.stock);
    return {
      id,
      name: String(product.name || `商品 ${id}`),
      price: Number(product.price) || 0,
      category: String(product.category || ""),
      image_url: String(product.image_url || ""),
      stock: Number.isFinite(stock) ? stock : 0,
    };
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return new Map();
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return new Map();

      const map = new Map();
      data.forEach((item) => {
        const product = normalizeProduct(item?.product);
        const qty = Number(item?.qty);
        if (!product || !Number.isInteger(qty) || qty <= 0) return;
        map.set(product.id, { product, qty });
      });
      return map;
    } catch (err) {
      console.warn("[cart] 读取本地购物车失败：", err);
      return new Map();
    }
  }

  let cart = loadCart();
  let bound = false;

  function saveCart() {
    try {
      const data = [...cart.values()].map(({ product, qty }) => ({ product, qty }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn("[cart] 保存本地购物车失败：", err);
    }
  }

  function count() {
    let n = 0;
    cart.forEach((item) => (n += item.qty));
    return n;
  }

  function total() {
    let sum = 0;
    cart.forEach((item) => (sum += item.qty * item.product.price));
    return sum;
  }

  function openDrawer() {
    $("#cartDrawer")?.classList.add("open");
    $("#cartMask")?.classList.add("open");
  }

  function closeDrawer() {
    $("#cartDrawer")?.classList.remove("open");
    $("#cartMask")?.classList.remove("open");
  }

  function render() {
    const badge = $("#navCartBadge");
    if (badge) badge.textContent = String(count());

    const drawerCount = $("#drawerCartCount");
    if (drawerCount) drawerCount.textContent = String(count());

    const totalEl = $("#cartTotal");
    if (totalEl) totalEl.textContent = formatPrice(total());

    const box = $("#cartItems");
    if (!box) return;
    box.innerHTML = "";

    if (cart.size === 0) {
      const empty = document.createElement("div");
      empty.className = "cart-empty";
      empty.textContent = "购物车还是空的，去挑点好物吧～";
      box.appendChild(empty);
      return;
    }

    cart.forEach((item, id) => {
      const product = item.product;
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <img src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}">
        <div class="meta">
          <div class="name" title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</div>
          <div class="unit">${formatPrice(product.price)}</div>
          <div class="qty-row">
            <button class="qty-btn" data-act="minus" data-id="${id}" aria-label="减少数量">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" data-act="plus" data-id="${id}" aria-label="增加数量">+</button>
            <button class="remove" data-act="remove" data-id="${id}">删除</button>
          </div>
        </div>`;

      const image = row.querySelector("img");
      image.addEventListener(
        "error",
        () => {
          image.src = placeholderImg(product.category || "Nova");
        },
        { once: true }
      );
      box.appendChild(row);
    });
  }

  function refresh() {
    saveCart();
    render();
  }

  function add(product, { open = true } = {}) {
    const normalized = normalizeProduct(product);
    if (!normalized) return;

    const entry = cart.get(normalized.id);
    if (entry) {
      entry.qty += 1;
      entry.product = normalized;
    } else {
      cart.set(normalized.id, { product: normalized, qty: 1 });
    }
    refresh();
    if (open) openDrawer();
  }

  function changeQty(id, delta) {
    const entry = cart.get(id);
    if (!entry) return;
    entry.qty += delta;
    if (entry.qty <= 0) cart.delete(id);
    refresh();
  }

  function remove(id) {
    if (!cart.delete(id)) return;
    refresh();
  }

  function clear() {
    cart.clear();
    refresh();
  }

  async function checkout() {
    if (cart.size === 0) {
      alert("购物车是空的，先添加商品再结算吧～");
      return;
    }

    const items = [...cart.entries()].map(([id, item]) => ({ id, qty: item.qty }));
    const btn = $("#checkoutBtn");
    const originalText = btn ? btn.textContent : "";
    if (btn) {
      btn.disabled = true;
      btn.textContent = "提交中…";
    }

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.code !== 0) {
        throw new Error(body.message || `HTTP ${res.status}`);
      }

      alert(
        `下单成功！\n订单号：${body.data.order_no}\n合计：${formatPrice(body.data.total_price)}`
      );
      clear();
      closeDrawer();
    } catch (err) {
      console.error("[cart] 创建订单失败：", err);
      const message =
        err instanceof TypeError ? "无法连接后端服务，请确认 npm start 已运行" : err.message;
      alert(`下单失败：${message}`);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    }
  }

  function bindUI() {
    if (bound) return;
    bound = true;

    $("#cartOpenBtn")?.addEventListener("click", openDrawer);
    $("#cartCloseBtn")?.addEventListener("click", closeDrawer);
    $("#cartMask")?.addEventListener("click", closeDrawer);
    $("#checkoutBtn")?.addEventListener("click", checkout);

    $("#cartItems")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;
      const id = Number(btn.dataset.id);
      if (btn.dataset.act === "plus") changeQty(id, 1);
      if (btn.dataset.act === "minus") changeQty(id, -1);
      if (btn.dataset.act === "remove") remove(id);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDrawer();
    });

    window.addEventListener("storage", (e) => {
      if (e.key !== STORAGE_KEY) return;
      cart = loadCart();
      render();
    });

    window.addEventListener("pageshow", () => {
      cart = loadCart();
      render();
    });

    render();
  }

  window.NovaCart = {
    add,
    open: openDrawer,
    close: closeDrawer,
    count,
    total,
    clear,
    render,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindUI);
  } else {
    bindUI();
  }
})();
