(function () {
  "use strict";

  const FAKE_USER = { username: "ebi", password: "123456" };
  const STORAGE_KEYS = { cart: "rimoon_cart", user: "rimoon_user" };

  const legalPages = {
    rules: {
      title: "قوانین و مقررات",
      content: `
        <ul>
          <li>همه قیمت‌ها به تومان و شامل مالیات بر ارزش افزوده می‌باشد.</li>
          <li>ثبت سفارش به معنای پذیرش کامل قوانین و مقررات فروشگاه است.</li>
          <li>سفارش‌ها پس از پردازش به‌صورت بسته‌بندی شده و دارای فاکتور ارسال می‌شوند.</li>
          <li>در صورت بروز هرگونه اختلاف، قوانین جمهوری اسلامی ایران ملاک رسیدگی است.</li>
          <li>فروشگاه مجاز به لغو سفارش در صورت اتمام موجودی و اطلاع‌رسانی به مشتری است.</li>
        </ul>`
    },
    privacy: {
      title: "حریم خصوصی",
      content: `
        <ul>
          <li>اطلاعات کاربران (نام، آدرس، شماره تماس) صرفاً برای پردازش سفارش استفاده می‌شود.</li>
          <li>اطلاعات شما نزد هیچ شخص ثالثی منتشر یا به فروش نمی‌رسد.</li>
          <li>اطلاعات پرداخت از طریق درگاه امن و رمزنگاری شده انجام می‌شود.</li>
          <li>کاربر می‌تواند در هر زمان درخواست حذف اطلاعات خود را ثبت کند.</li>
        </ul>`
    },
    returns: {
      title: "شرایط بازگشت کالا",
      content: `
        <ul>
          <li>به‌مدت ۷ روز پس از تحویل، امکان بازگشت کالا وجود دارد.</li>
          <li>کالا باید در بسته‌بندی اولیه و بدون استفاده باشد.</li>
          <li>هزینه بازگشت در صورت معیوب بودن کالا بر عهده فروشگاه است.</li>
          <li>مبلغ پس از بازبینی کالا حداکثر ۷۲ ساعت کاری به حساب شما بازگردانده می‌شود.</li>
        </ul>`
    }
  };

  let cart = [];
  let currentUser = null;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ---------- State ----------
  function loadState() {
    try {
      cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.cart)) || [];
    } catch {
      cart = [];
    }
    currentUser = localStorage.getItem(STORAGE_KEYS.user);
  }

  function saveCart() {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  }

  // ---------- Render helpers ----------
  function productCard(product, withQty) {
    const inCart = cart.find((i) => i.id === product.id);
    const qty = inCart ? inCart.qty : 0;
    const qtyHtml = withQty && qty > 0
      ? `<div class="qty">
          <button data-minus="${product.id}">−</button>
          <span>${toFa(qty)}</span>
          <button data-plus="${product.id}">+</button>
        </div>`
      : "";

    return `
      <article class="product-card">
        <div class="product-img" style="background:${product.gradient}">${product.emoji}</div>
        <div class="product-info">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div class="product-price">${formatPrice(product.price)} ${CURRENCY}</div>
          <div class="product-actions">
            ${qtyHtml}
            <button class="add-btn" data-add="${product.id}">${qty > 0 ? "افزایش تعداد" : "افزودن به سبد"}</button>
          </div>
        </div>
      </article>`;
  }

  function renderProductGrids() {
    $("#featuredGrid").innerHTML = PRODUCTS.map((p) => productCard(p, true)).join("");
    $("#productsGrid").innerHTML = PRODUCTS.map((p) => productCard(p, true)).join("");
  }

  function toFa(str) {
    const faDigits = "۰۱۲۳۴۵۶۷۸۹";
    return String(str).replace(/[0-9]/g, (d) => faDigits[d]);
  }

  // ---------- Cart ----------
  function cartCount() {
    return cart.reduce((sum, i) => sum + i.qty, 0);
  }

  function cartTotal() {
    return cart.reduce((sum, i) => sum + i.qty * i.price, 0);
  }

  function updateCartUI() {
    $("#cartCount").textContent = toFa(cartCount());

    const itemsEl = $("#cartItems");
    if (!cart.length) {
      itemsEl.innerHTML = `<div class="cart-empty"><span>🛒</span>سبد خرید شما خالی است.</div>`;
      $("#cartTotal").textContent = `۰ ${CURRENCY}`;
      $("#checkoutBtn").disabled = true;
      $("#clearCartBtn").disabled = true;
      return;
    }

    itemsEl.innerHTML = cart.map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.id);
      return `
        <div class="cart-item">
          <div class="cart-item-img" style="background:${product.gradient}">${product.emoji}</div>
          <div class="cart-item-info">
            <h4>${product.name}</h4>
            <p>${formatPrice(item.price)} ${CURRENCY}</p>
          </div>
          <div class="cart-item-actions">
            <div class="qty">
              <button data-minus="${item.id}">−</button>
              <span>${toFa(item.qty)}</span>
              <button data-plus="${item.id}">+</button>
            </div>
            <button class="remove-item" data-remove="${item.id}" aria-label="حذف">🗑️</button>
          </div>
        </div>`;
    }).join("");

    $("#cartTotal").textContent = `${formatPrice(cartTotal())} ${CURRENCY}`;
    $("#checkoutBtn").disabled = false;
    $("#clearCartBtn").disabled = false;
    renderProductGrids();
  }

  function addToCart(id) {
    const item = cart.find((i) => i.id === id);
    if (item) {
      item.qty += 1;
    } else {
      const product = PRODUCTS.find((p) => p.id === id);
      cart.push({ id, qty: 1, price: product.price });
    }
    saveCart();
    updateCartUI();
    toast("محصول به سبد خرید اضافه شد", "success");
  }

  function changeQty(id, delta) {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter((i) => i.id !== id);
    }
    saveCart();
    updateCartUI();
  }

  function removeFromCart(id) {
    cart = cart.filter((i) => i.id !== id);
    saveCart();
    updateCartUI();
    toast("محصول از سبد حذف شد");
  }

  function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
    toast("سبد خرید خالی شد");
  }

  // ---------- Cart drawer ----------
  function openCart() {
    $("#cartDrawer").classList.add("open");
    $("#overlay").classList.remove("hidden");
  }

  function closeCart() {
    $("#cartDrawer").classList.remove("open");
    $("#overlay").classList.add("hidden");
  }

  // ---------- Auth ----------
  function login(username, password) {
    if (username === FAKE_USER.username && password === FAKE_USER.password) {
      currentUser = username;
      localStorage.setItem(STORAGE_KEYS.user, username);
      updateAuthUI();
      closeLogin();
      toast(`خوش آمدید، ${username} عزیز 👋`, "success");
      return true;
    }
    return false;
  }

  function logout() {
    currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.user);
    updateAuthUI();
    toast("با موفقیت از حساب خارج شدید");
  }

  function updateAuthUI() {
    if (currentUser) {
      $("#loginBtn").classList.add("hidden");
      $("#userBox").classList.remove("hidden");
      $("#userName").textContent = currentUser;
    } else {
      $("#loginBtn").classList.remove("hidden");
      $("#userBox").classList.add("hidden");
    }
  }

  function openLogin() {
    $("#loginModal").classList.remove("hidden");
    $("#loginError").classList.add("hidden");
    $("#loginForm").reset();
    setTimeout(() => $("#loginUser").focus(), 50);
  }

  function closeLogin() {
    $("#loginModal").classList.add("hidden");
  }

  // ---------- Routing ----------
  const routes = ["home", "products", "about", "contact", "legal"];

  function navigate(page) {
    if (!routes.includes(page)) page = "home";
    $$(".page").forEach((el) => el.classList.remove("active"));
    $(`#${page}`).classList.add("active");
    $$(".nav-link").forEach((el) => {
      el.classList.toggle("active", el.dataset.nav === page);
    });
    if (page !== "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function showLegal(key) {
    const data = legalPages[key] || legalPages.rules;
    $("#legalTitle").textContent = data.title;
    $("#legalContent").innerHTML = data.content;
  }

  // ---------- Toast ----------
  let toastTimer;

  function toast(message, type = "") {
    const el = $("#toast");
    el.textContent = message;
    el.className = `toast ${type}`;
    el.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add("hidden"), 2600);
  }

  // ---------- Checkout ----------
  function checkout() {
    if (!cart.length) return;
    if (!currentUser) {
      toast("برای ثبت سفارش ابتدا وارد شوید", "error");
      openLogin();
      return;
    }
    const total = cartTotal();
    cart = [];
    saveCart();
    updateCartUI();
    closeCart();
    toast(`سفارش شما با موفقیت ثبت شد. مبلغ ${formatPrice(total)} ${CURRENCY} — این نسخه آزمایشی است`, "success");
  }

  // ---------- Events ----------
  function bindEvents() {
    $("#cartBtn").addEventListener("click", openCart);
    $("#closeCart").addEventListener("click", closeCart);
    $("#overlay").addEventListener("click", closeCart);
    $("#loginBtn").addEventListener("click", openLogin);
    $("#closeLogin").addEventListener("click", closeLogin);
    $("#logoutBtn").addEventListener("click", logout);
    $("#clearCartBtn").addEventListener("click", clearCart);
    $("#checkoutBtn").addEventListener("click", checkout);

    $("#loginForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = login($("#loginUser").value.trim(), $("#loginPass").value);
      if (!ok) {
        $("#loginError").classList.remove("hidden");
      }
    });

    document.addEventListener("click", (e) => {
      const addBtn = e.target.closest("[data-add]");
      if (addBtn) {
        addToCart(Number(addBtn.dataset.add));
        return;
      }
      const minusBtn = e.target.closest("[data-minus]");
      if (minusBtn) {
        changeQty(Number(minusBtn.dataset.minus), -1);
        return;
      }
      const plusBtn = e.target.closest("[data-plus]");
      if (plusBtn) {
        changeQty(Number(plusBtn.dataset.plus), 1);
        return;
      }
      const removeBtn = e.target.closest("[data-remove]");
      if (removeBtn) {
        removeFromCart(Number(removeBtn.dataset.remove));
        return;
      }
      const navLink = e.target.closest("[data-nav]");
      if (navLink) {
        navigate(navLink.dataset.nav);
        closeCart();
        return;
      }
      const legalLink = e.target.closest("[data-legal]");
      if (legalLink) {
        showLegal(legalLink.dataset.legal);
        navigate("legal");
        closeCart();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeCart();
        closeLogin();
      }
    });
  }

  // ---------- Init ----------
  function init() {
    loadState();
    bindEvents();
    renderProductGrids();
    updateCartUI();
    updateAuthUI();
    navigate("home");
  }

  init();
})();