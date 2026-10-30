
document.addEventListener("DOMContentLoaded", () => {
  // Mystique Palate - Single Cart and Order Summary
  // Replace the entire old script.js with this file.

  if (window.__mystiquePalateCartInitialized) return;
  window.__mystiquePalateCartInitialized = true;

  const FACEBOOK_URL =
    "https://www.facebook.com/profile.php?id=61589586893012";

  const money = (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 2,
    }).format(amount);

  const parsePrice = (text) => {
    const match = String(text || "").replace(/,/g, "").match(/₱\s*(\d+(?:\.\d+)?)/);
    return match ? Number(match[1]) : 0;
  };

  // Remove any old cart UI left in the HTML.
  document.querySelectorAll(
    "#mpCartOverlay, #mpCartButton, #mpCartPanel, #mpOrderSummary"
  ).forEach((element) => element.remove());

  const style = document.createElement("style");
  style.id = "mpCartStyles";
  style.textContent = `
    .mp-cart-button, .mp-cart-panel button {
      font: inherit;
      cursor: pointer;
    }

    .mp-cart-button {
      position: fixed;
      right: 22px;
      bottom: 22px;
      z-index: 9000;
      border: 1px solid #C5A46D;
      border-radius: 999px;
      padding: 14px 20px;
      background: #243B2D;
      color: #F8F3E8;
      box-shadow: 0 5px 18px #0003;
    }

    .mp-cart-count {
      display: inline-flex;
      min-width: 23px;
      height: 23px;
      margin-left: 8px;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #C5A46D;
      color: #243B2D;
      font-size: 12px;
      font-weight: bold;
    }

    .mp-cart-overlay {
      position: fixed;
      inset: 0;
      z-index: 9998;
      background: rgba(0, 0, 0, .55);
      display: none;
    }

    .mp-cart-overlay.mp-open {
      display: block;
    }

    .mp-cart-panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      width: min(460px, 100%);
      padding: 22px;
      overflow-y: auto;
      overscroll-behavior: contain;
      box-sizing: border-box;
      background: #F8F3E8;
      color: #243B2D;
      box-shadow: -8px 0 30px #0003;
      transform: translateX(105%);
      visibility: hidden;
      transition: transform .25s ease, visibility .25s ease;
    }

    .mp-cart-panel.mp-open {
      transform: translateX(0);
      visibility: visible;
    }

    .mp-cart-panel *,
    .mp-cart-panel *::before,
    .mp-cart-panel *::after {
      box-sizing: border-box;
    }

    .mp-cart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-bottom: 14px;
      border-bottom: 1px solid #C5A46D;
    }

    .mp-cart-header h2 {
      margin: 0;
      font-size: 24px;
    }

    .mp-close-cart {
      border: 0;
      background: transparent;
      color: #243B2D;
      font-size: 28px;
      padding: 4px 10px;
    }

    .mp-cart-items {
      display: flex;
      flex-direction: column;
      gap: 0;
      margin-top: 8px;
    }

    .mp-cart-item {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      padding: 16px 0;
      border-bottom: 1px solid #ddd2bf;
    }

    .mp-cart-item h3 {
      margin: 0 0 6px;
      font-size: 16px;
      overflow-wrap: anywhere;
    }

    .mp-cart-item p {
      margin: 0;
      font-size: 14px;
    }

    .mp-item-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 10px;
    }

    .mp-item-controls button {
      width: 30px;
      height: 30px;
      border: 1px solid #C5A46D;
      border-radius: 6px;
      background: #fffdf8;
      color: #243B2D;
    }

    .mp-item-controls .mp-remove-item {
      width: auto;
      border: 0;
      background: transparent;
      text-decoration: underline;
    }

    .mp-cart-empty {
      padding: 28px 0;
      text-align: center;
      color: #655f53;
    }

    .mp-order-summary {
      margin-top: 20px;
      padding: 18px;
      border: 1px solid #C5A46D;
      border-radius: 12px;
      background: #fffdf8;
    }

    .mp-order-summary h3 {
      margin: 0 0 14px;
      font-size: 19px;
    }

    .mp-summary-line {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin: 10px 0;
      overflow-wrap: anywhere;
    }

    .mp-summary-total {
      padding-top: 12px;
      margin-top: 12px;
      border-top: 1px solid #C5A46D;
      font-size: 19px;
      font-weight: bold;
    }

    .mp-facebook-order,
    .mp-copy-order,
    .mp-clear-cart {
      width: 100%;
      padding: 13px 15px;
      margin-top: 12px;
      border-radius: 8px;
      font-weight: 600;
    }

    .mp-facebook-order {
      border: 0;
      background: #243B2D;
      color: #F8F3E8;
    }

    .mp-copy-order {
      border: 1px solid #243B2D;
      background: transparent;
      color: #243B2D;
    }

    .mp-clear-cart {
      border: 0;
      background: transparent;
      color: #7a3028;
      text-decoration: underline;
    }

    .mp-cart-note {
      margin: 12px 0 0;
      font-size: 12px;
      line-height: 1.5;
      color: #655f53;
    }

    .mp-add-to-cart {
      display: block;
      width: 100%;
      margin-top: 12px;
      padding: 10px 14px;
      border: 1px solid #C5A46D;
      border-radius: 7px;
      background: #243B2D;
      color: #F8F3E8;
      cursor: pointer;
      font: inherit;
    }

    body.mp-cart-is-open {
      overflow: hidden;
    }

    @media (max-width: 480px) {
      .mp-cart-button {
        right: 14px;
        bottom: 14px;
        padding: 12px 15px;
      }

      .mp-cart-panel {
        padding: 17px;
      }
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement("div");
  overlay.id = "mpCartOverlay";
  overlay.className = "mp-cart-overlay";
  overlay.setAttribute("aria-hidden", "true");

  const cartButton = document.createElement("button");
  cartButton.id = "mpCartButton";
  cartButton.className = "mp-cart-button";
  cartButton.type = "button";
  cartButton.innerHTML =
    '🛒 Your Cart <span class="mp-cart-count" id="mpCartCount">0</span>';

  const panel = document.createElement("aside");
  panel.id = "mpCartPanel";
  panel.className = "mp-cart-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-labelledby", "mpCartTitle");

  // There is only ONE order summary, inside the cart panel.
  panel.innerHTML = `
    <div class="mp-cart-header">
      <h2 id="mpCartTitle">Your Cart</h2>
      <button class="mp-close-cart" id="mpCloseCart"
        type="button" aria-label="Close cart">&times;</button>
    </div>

    <div class="mp-cart-items" id="mpCartItems"></div>

    <section class="mp-order-summary" id="mpOrderSummary">
      <h3>Order Summary</h3>
      <div id="mpSummaryLines"></div>
      <div class="mp-summary-line mp-summary-total">
        <span>Total</span>
        <span id="mpCartTotal">₱0.00</span>
      </div>

      <button class="mp-facebook-order" id="mpFacebookOrder" type="button">
        Order via Facebook
      </button>
      <button class="mp-copy-order" id="mpCopyOrder" type="button">
        Copy Order Details
      </button>
      <button class="mp-clear-cart" id="mpClearCart" type="button">
        Clear Cart
      </button>

      <p class="mp-cart-note">
        Review your items and total before proceeding. Your order is not
        submitted automatically; confirm availability, delivery, and payment
        with Mystique Palate through Facebook.
      </p>
    </section>
  `;

  document.body.append(overlay, cartButton, panel);

  const itemsContainer = document.getElementById("mpCartItems");
  const countElement = document.getElementById("mpCartCount");
  const summaryLines = document.getElementById("mpSummaryLines");
  const totalElement = document.getElementById("mpCartTotal");

  const cart = new Map();

  function openCart() {
    overlay.classList.add("mp-open");
    panel.classList.add("mp-open");
    document.body.classList.add("mp-cart-is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.getElementById("mpCloseCart").focus();
  }

  function closeCart() {
    overlay.classList.remove("mp-open");
    panel.classList.remove("mp-open");
    document.body.classList.remove("mp-cart-is-open");
    overlay.setAttribute("aria-hidden", "true");
    cartButton.focus();
  }

  function getTotalQuantity() {
    let quantity = 0;
    cart.forEach((item) => {
      quantity += item.quantity;
    });
    return quantity;
  }

  function getTotalPrice() {
    let total = 0;
    cart.forEach((item) => {
      total += item.price * item.quantity;
    });
    return total;
  }

  function makeOrderText() {
    const lines = ["MYSTIQUE PALATE - ORDER DETAILS", ""];

    cart.forEach((item) => {
      lines.push(
        `${item.name} x ${item.quantity} = ${money(item.price * item.quantity)}`
      );
    });

    lines.push("");
    lines.push(`Total: ${money(getTotalPrice())}`);
    lines.push("");
    lines.push("Please confirm availability and ordering details.");

    return lines.join("\n");
  }

  function renderCart() {
    countElement.textContent = getTotalQuantity();
    itemsContainer.replaceChildren();
    summaryLines.replaceChildren();
    totalElement.textContent = money(getTotalPrice());

    if (cart.size === 0) {
      const empty = document.createElement("p");
      empty.className = "mp-cart-empty";
      empty.textContent = "Your cart is empty. Add something delicious!";
      itemsContainer.appendChild(empty);

      const emptySummary = document.createElement("p");
      emptySummary.textContent = "No items added yet.";
      summaryLines.appendChild(emptySummary);
    } else {
      cart.forEach((item, key) => {
        const row = document.createElement("div");
        row.className = "mp-cart-item";

        const details = document.createElement("div");

        const name = document.createElement("h3");
        name.textContent = item.name;

        const unitPrice = document.createElement("p");
        unitPrice.textContent = `${money(item.price)} each`;

        const controls = document.createElement("div");
        controls.className = "mp-item-controls";

        const minus = document.createElement("button");
        minus.type = "button";
        minus.textContent = "−";
        minus.setAttribute("aria-label", `Decrease ${item.name}`);
        minus.addEventListener("click", () => changeQuantity(key, -1));

        const quantity = document.createElement("span");
        quantity.textContent = item.quantity;

        const plus = document.createElement("button");
        plus.type = "button";
        plus.textContent = "+";
        plus.setAttribute("aria-label", `Increase ${item.name}`);
        plus.addEventListener("click", () => changeQuantity(key, 1));

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "mp-remove-item";
        remove.textContent = "Remove";
        remove.addEventListener("click", () => {
          cart.delete(key);
          renderCart();
        });

        controls.append(minus, quantity, plus, remove);
        details.append(name, unitPrice, controls);

        const subtotal = document.createElement("strong");
        subtotal.textContent = money(item.price * item.quantity);

        row.append(details, subtotal);
        itemsContainer.appendChild(row);

        const summaryRow = document.createElement("div");
        summaryRow.className = "mp-summary-line";

        const summaryName = document.createElement("span");
        summaryName.textContent = `${item.name} × ${item.quantity}`;

        const summaryPrice = document.createElement("span");
        summaryPrice.textContent = money(item.price * item.quantity);

        summaryRow.append(summaryName, summaryPrice);
        summaryLines.appendChild(summaryRow);
      });
    }

    const emptyCart = cart.size === 0;
    document.getElementById("mpFacebookOrder").disabled = emptyCart;
    document.getElementById("mpCopyOrder").disabled = emptyCart;
    document.getElementById("mpClearCart").disabled = emptyCart;
  }

  function changeQuantity(key, amount) {
    const item = cart.get(key);
    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
      cart.delete(key);
    }

    renderCart();
  }

  function addItem(name, price) {
    const key = `${name}::${price}`;
    const existing = cart.get(key);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.set(key, { name, price, quantity: 1 });
    }

    renderCart();
  }

  // Add one Add to Cart button to each menu card.
  document.querySelectorAll(".menu-card").forEach((card) => {
    if (card.querySelector(".mp-add-to-cart")) return;

    const titleElement = card.querySelector("h2, h3, h4");
    const priceElement = card.querySelector(".price");

    if (!titleElement || !priceElement) return;

    const name = titleElement.textContent.trim();
    const price = parsePrice(priceElement.textContent);

    if (!name || price <= 0) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "mp-add-to-cart";
    button.textContent = "Add to Cart";
    button.addEventListener("click", () => {
      addItem(name, price);
    });

    const target = card.querySelector(".menu-info") || card;
    target.appendChild(button);
  });

  // Keep the existing menu category filters working.
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter =
        button.dataset.filter ||
        button.getAttribute("data-filter") ||
        "all";

      document.querySelectorAll(".menu-card").forEach((card) => {
        const category = card.dataset.category || "";
        const show =
          filter === "all" ||
          filter === "*" ||
          category === filter;

        card.style.display = show ? "" : "none";
      });

      filterButtons.forEach((otherButton) => {
        otherButton.classList.toggle("active", otherButton === button);
      });
    });
  });

  cartButton.addEventListener("click", openCart);
  document.getElementById("mpCloseCart").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel.classList.contains("mp-open")) {
      closeCart();
    }
  });

  document.getElementById("mpClearCart").addEventListener("click", () => {
    cart.clear();
    renderCart();
  });

  document.getElementById("mpCopyOrder").addEventListener("click", async () => {
    
document.getElementById("mpCopyOrder").addEventListener("click", async () => {
  if (cart.size === 0) {
    alert("Your cart is empty!");
    return;
  }

  const orderText = makeOrderText();

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(orderText);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = orderText;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const copied = document.execCommand("copy");
      textArea.remove();

      if (!copied) {
        throw new Error("Copy failed");
      }
    }

    alert("✅ Order details copied! Paste them into Messenger.");
  } catch (error) {
    console.error("Clipboard error:", error);
    alert(
      "Copying failed. Please open your website using VS Code Live Server and try again."
    );
  }
});

  });

  
  document.getElementById("mpFacebookOrder").addEventListener("click", () => {
    if (cart.size === 0) {
      alert("Please add an item to your cart first.");
      return;
    }

    const orderText = makeOrderText();

    // Open Facebook independently of clipboard access.
    const facebookWindow = window.open(
      FACEBOOK_URL,
      "_blank"
    );

    // Offer the order details for copying.
    if (facebookWindow) {
      window.prompt(
        "Copy your order details below, then paste them into your Facebook message:",
        orderText
      );
    } else {
      alert("Your browser blocked the Facebook window. Please allow pop-ups and try again.");
      window.prompt(
        "Copy your order details below:",
        orderText
      );
    }
  });


  renderCart();
});
