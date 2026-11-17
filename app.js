const categories = {
  "mobile-gadgets": { label: "Mobile Gadgets", intro: "Little upgrades that make your everyday tech work harder." },
  electronics: { label: "Electronics", intro: "Useful tech for your desk, your home, and everything between." },
  "home-kitchen": { label: "Home & Kitchen", intro: "Considered essentials for the spaces you live in." },
  lifestyle: { label: "Lifestyle", intro: "Everyday companions for wherever the day takes you." }
};

const pages = {
  about: { title: "A more thoughtful way to find things", eyebrow: "ABOUT SMARTFINDS PK", body: "SmartFinds PK is an independent product discovery website for shoppers in Pakistan. We bring useful product ideas together in one place, across technology, home, and everyday living. We do not make or stock the products we feature. Our aim is to make discovering a next good find feel a little simpler and more considered." },
  privacy: { title: "Privacy policy", eyebrow: "YOUR PRIVACY", body: "SmartFinds PK is a static product discovery website. It has no account system, checkout, payment processing, or server-side contact form. Search and catalog filtering happen in your browser. The comparison list and any contact draft you save are stored in this browser using local storage. We do not receive them. When you follow an external retailer link, that destination may use its own cookies and privacy practices. Product photos and web fonts may be requested from their respective providers. Review those providers' policies before using their services." },
  disclosure: { title: "Affiliate disclosure", eyebrow: "HOW THIS SITE WORKS", body: "SmartFinds PK may earn a commission if you purchase through a genuine affiliate link on this site. This does not add a fee to your purchase. Any affiliate link will be identified and opens the retailer's website; the retailer is responsible for prices, stock, shipping, returns, and customer service. We do not currently publish verified prices or availability. Listings marked demo have no affiliate link and are examples only." }
};

const escapeHTML = (value = "") => String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const main = document.querySelector("#main");
const query = new URLSearchParams(location.search);
let products = [];
let toastTimer;

function categoryName(id) {
  return categories[id]?.label || "Uncategorized";
}

function getCompareIds() {
  try {
    const stored = JSON.parse(localStorage.getItem("smartfinds-compare") || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function setCompareIds(ids) {
  try {
    localStorage.setItem("smartfinds-compare", JSON.stringify(ids));
  } catch {
    showToast("Comparison could not be saved in this browser.");
  }
  updateCompareCount();
}

function updateCompareCount() {
  document.querySelector("#compare-count").textContent = getCompareIds().length;
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function validAffiliateUrl(product) {
  if (typeof product.affiliateUrl !== "string" || !product.affiliateUrl.trim()) return null;
  try {
    const url = new URL(product.affiliateUrl);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function displayPrice(product) {
  if (typeof product.pricePkr !== "number" || !Number.isFinite(product.pricePkr) || product.pricePkr < 0) return "Price not listed";
  return `PKR ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(product.pricePkr)}`;
}

function productCard(product) {
  const affiliateUrl = validAffiliateUrl(product);
  const label = product.demo || !affiliateUrl ? "Demo product" : "Affiliate link";
  const image = escapeHTML(product.image || "");
  return `<article class="product-card">
    <a class="product-image-link" href="?product=${encodeURIComponent(product.id)}" aria-label="View ${escapeHTML(product.name)}">
      <img class="product-image" src="${image}" alt="${escapeHTML(product.name)}" loading="lazy" onerror="this.classList.add('image-unavailable');this.removeAttribute('src')">
      <span class="product-tag ${affiliateUrl && !product.demo ? "tag-affiliate" : ""}">${label}</span>
    </a>
    <div class="product-info"><span class="product-category">${escapeHTML(categoryName(product.category))}</span>
      <h3><a href="?product=${encodeURIComponent(product.id)}">${escapeHTML(product.name)}</a></h3>
      <p class="product-price">${displayPrice(product)}</p>
      <div class="product-actions">${affiliateUrl && !product.demo ? `<a class="button button-primary button-small" href="${escapeHTML(affiliateUrl)}" target="_blank" rel="nofollow sponsored noopener">Buy Now <span aria-hidden="true">↗</span></a>` : `<span class="demo-note">No verified affiliate link</span>`}
      <button class="compare-button ${getCompareIds().includes(product.id) ? "is-added" : ""}" type="button" data-compare="${escapeHTML(product.id)}" aria-label="${getCompareIds().includes(product.id) ? "Remove" : "Add"} ${escapeHTML(product.name)} ${getCompareIds().includes(product.id) ? "from" : "to"} comparison">${getCompareIds().includes(product.id) ? "✓" : "+"}</button></div>
    </div>
  </article>`;
}

function productGrid(list) {
  if (!list.length) return `<div class="empty-state"><span class="empty-mark" aria-hidden="true">⌕</span><h2>No finds just yet</h2><p>Try a different search or category.</p><a class="text-link" href="index.html">Back to all finds <span aria-hidden="true">→</span></a></div>`;
  return `<div class="product-grid">${list.map(productCard).join("")}</div>`;
}

function toolbar(selectedCategory, sort) {
  return `<div class="catalog-toolbar"><span class="result-count" id="result-count"></span><div class="toolbar-controls">
    <label class="select-control">Category<select id="category-filter"><option value="all" ${selectedCategory === "all" ? "selected" : ""}>All categories</option>${Object.entries(categories).map(([id, category]) => `<option value="${id}" ${selectedCategory === id ? "selected" : ""}>${category.label}</option>`).join("")}</select></label>
    <label class="select-control">Sort<select id="sort-filter"><option value="az" ${sort === "az" ? "selected" : ""}>Name: A to Z</option><option value="za" ${sort === "za" ? "selected" : ""}>Name: Z to A</option></select></label>
  </div></div>`;
}

function renderHome() {
  const featured = products.slice(0, 4);
  const categoryTiles = Object.entries(categories).map(([id, category], index) => `<a class="category-tile tile-${index + 1}" href="?category=${id}"><span class="tile-number">0${index + 1}</span><span>${category.label}</span><span class="tile-arrow" aria-hidden="true">↗</span></a>`).join("");
  main.innerHTML = `<section class="hero"><div class="wrap hero-inner"><div class="hero-copy"><span class="eyebrow"><span class="eyebrow-dot"></span> PRODUCT DISCOVERY, MADE PERSONAL</span><h1>Find the<br>good <span>stuff.</span></h1><p>A carefully gathered collection of finds for daily life in Pakistan. Explore what catches your eye.</p><a class="button button-primary" href="#latest-finds">Explore the collection <span aria-hidden="true">↓</span></a><span class="hero-footnote">Independent discovery. No checkout here.</span></div><div class="hero-art" aria-label="A selection of everyday products"><div class="art-label">THE EVERYDAY EDIT <span>01 / 04</span></div><div class="art-photo art-photo-main"><img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=960&q=85" alt="Coffee being poured into a cup" fetchpriority="high"></div><div class="art-photo art-photo-side"><img src="https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=640&q=85" alt="Wireless earbuds" fetchpriority="high"></div><div class="art-stamp"><span>GOOD<br>FINDS</span><span class="stamp-star" aria-hidden="true">✳</span></div><div class="art-caption">A LITTLE OF WHAT WE LOVE <span aria-hidden="true">↗</span></div></div></div></section>
    <section class="trust-strip"><div class="wrap trust-inner"><span><b>01</b> Thoughtfully selected</span><span><b>02</b> Clear about affiliate links</span><span><b>03</b> Built for Pakistani shoppers</span></div></section>
    <section class="section categories-section"><div class="wrap"><div class="section-heading"><div><span class="eyebrow">A PLACE TO START</span><h2>Explore by category</h2></div><p>From pocket-sized essentials to things that make home feel more like yours.</p></div><div class="category-tiles">${categoryTiles}</div></div></section>
    <section class="section latest-section" id="latest-finds"><div class="wrap"><div class="section-heading"><div><span class="eyebrow">THE SHORTLIST</span><h2>Fresh finds</h2></div><a class="text-link" href="?category=best-deals">Explore all products <span aria-hidden="true">→</span></a></div><div class="product-grid">${featured.map(productCard).join("")}</div><p class="demo-disclaimer">Demo listings are examples only. Prices and retailer details have not been verified.</p></div></section>`;
  setActiveNav("home");
}

function renderCatalog() {
  const requestedCategory = query.get("category");
  const initialCategory = requestedCategory === "best-deals" ? "all" : (categories[requestedCategory] ? requestedCategory : "all");
  const isDeals = requestedCategory === "best-deals";
  const title = isDeals ? "Best Deals" : initialCategory === "all" ? "Explore all finds" : categories[initialCategory].label;
  const intro = isDeals ? "A handpicked browse of the catalog. Check each retailer for current prices and promotions." : initialCategory === "all" ? "Browse the full collection and find something useful for your day." : categories[initialCategory].intro;
  const search = (query.get("q") || "").trim();
  main.innerHTML = `<section class="page-banner"><div class="wrap"><a class="breadcrumb" href="index.html">Home</a><span class="breadcrumb-divider">/</span><span>${escapeHTML(title)}</span><span class="eyebrow page-eyebrow">SMARTFINDS PK / DISCOVERY</span><h1>${escapeHTML(title)}</h1><p>${escapeHTML(intro)}</p></div></section><section class="section catalog-section"><div class="wrap">${search ? `<p class="search-summary">Search results for <strong>“${escapeHTML(search)}”</strong></p>` : ""}${toolbar(initialCategory, "az")}<div id="catalog-results"></div><p class="demo-disclaimer">Product listings are demos until verified. No prices, ratings, reviews, or availability are provided.</p></div></section>`;
  setActiveNav(isDeals ? "best-deals" : initialCategory);
  const categoryFilter = document.querySelector("#category-filter");
  if (isDeals) categoryFilter.value = "all";
  function update() {
    const category = categoryFilter.value;
    const sort = document.querySelector("#sort-filter").value;
    let filtered = products.filter(product => {
      const matchesCategory = category === "all" || product.category === category;
      const text = `${product.name} ${categoryName(product.category)} ${product.description}`.toLowerCase();
      return matchesCategory && (!search || text.includes(search.toLowerCase()));
    });
    filtered.sort((a, b) => a.name.localeCompare(b.name) * (sort === "za" ? -1 : 1));
    document.querySelector("#result-count").textContent = `${filtered.length} ${filtered.length === 1 ? "find" : "finds"}`;
    document.querySelector("#catalog-results").innerHTML = productGrid(filtered);
  }
  categoryFilter.addEventListener("change", update);
  document.querySelector("#sort-filter").addEventListener("change", update);
  update();
}

function renderDetail(id) {
  const product = products.find(item => item.id === id);
  if (!product) {
    main.innerHTML = `<section class="section"><div class="wrap"><div class="empty-state"><span class="eyebrow">NOT FOUND</span><h1>We couldn't find that product.</h1><p>It may have moved or been removed from the catalog.</p><a class="button button-primary" href="index.html">Return home</a></div></div></section>`;
    return;
  }
  const affiliateUrl = validAffiliateUrl(product);
  main.innerHTML = `<section class="detail-section"><div class="wrap"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><a href="?category=${encodeURIComponent(product.category)}">${escapeHTML(categoryName(product.category))}</a><span>/</span><span>${escapeHTML(product.name)}</span></nav><div class="detail-layout"><div class="detail-image-wrap"><img class="detail-image" src="${escapeHTML(product.image || "")}" alt="${escapeHTML(product.name)}" onerror="this.classList.add('image-unavailable');this.removeAttribute('src')"><span class="product-tag">${product.demo || !affiliateUrl ? "Demo product" : "Affiliate link"}</span></div><div class="detail-copy"><span class="eyebrow">${escapeHTML(categoryName(product.category))}</span><h1>${escapeHTML(product.name)}</h1><p class="detail-price">${displayPrice(product)}</p><p class="detail-description">${escapeHTML(product.description)}</p><p class="availability-note"><span aria-hidden="true">i</span> Product details and availability have not been independently verified.</p><div class="detail-actions">${affiliateUrl && !product.demo ? `<a class="button button-primary" href="${escapeHTML(affiliateUrl)}" target="_blank" rel="nofollow sponsored noopener">Buy Now at retailer <span aria-hidden="true">↗</span></a>` : `<span class="button button-disabled" aria-disabled="true">Demo product · no affiliate link</span>`}<button class="button button-outline" type="button" data-compare="${escapeHTML(product.id)}">${getCompareIds().includes(product.id) ? "✓ Added to compare" : "+ Add to compare"}</button></div><p class="affiliate-note">${affiliateUrl && !product.demo ? "We may earn a commission from qualifying purchases. The retailer handles your order." : "This is a demo listing, not a verified retailer offer."}</p></div></div></div></section><section class="section related-section"><div class="wrap"><div class="section-heading"><div><span class="eyebrow">KEEP EXPLORING</span><h2>More in ${escapeHTML(categoryName(product.category))}</h2></div><a class="text-link" href="?category=${encodeURIComponent(product.category)}">See category <span aria-hidden="true">→</span></a></div><div class="product-grid">${products.filter(item => item.category === product.category && item.id !== product.id).slice(0, 3).map(productCard).join("")}</div></div></section>`;
  setActiveNav(product.category);
}

function renderCompare() {
  const selected = getCompareIds().map(id => products.find(product => product.id === id)).filter(Boolean);
  main.innerHTML = `<section class="page-banner"><div class="wrap"><a class="breadcrumb" href="index.html">Home</a><span class="breadcrumb-divider">/</span><span>Compare</span><span class="eyebrow page-eyebrow">MAKE A SIDE-BY-SIDE SHORTLIST</span><h1>Compare finds</h1><p>Keep a few ideas together while you decide what to explore next.</p></div></section><section class="section compare-section"><div class="wrap"><div class="compare-heading"><p>${selected.length} of 4 products selected</p>${selected.length ? `<button class="text-button" type="button" data-clear-compare>Clear all</button>` : ""}</div>${selected.length ? `<div class="compare-table-wrap"><table class="compare-table"><thead><tr><th scope="col">Product</th>${selected.map(product => `<th scope="col"><button class="remove-compare" data-remove-compare="${escapeHTML(product.id)}" aria-label="Remove ${escapeHTML(product.name)} from comparison">×</button><img src="${escapeHTML(product.image || "")}" alt="" onerror="this.classList.add('image-unavailable');this.removeAttribute('src')"><a href="?product=${encodeURIComponent(product.id)}">${escapeHTML(product.name)}</a></th>`).join("")}</tr></thead><tbody><tr><th scope="row">Category</th>${selected.map(product => `<td>${escapeHTML(categoryName(product.category))}</td>`).join("")}</tr><tr><th scope="row">Price</th>${selected.map(product => `<td>${displayPrice(product)}</td>`).join("")}</tr><tr><th scope="row">Product details</th>${selected.map(product => `<td>${escapeHTML(product.description)}</td>`).join("")}</tr><tr><th scope="row">Listing status</th>${selected.map(product => `<td><span class="compare-demo">${product.demo || !validAffiliateUrl(product) ? "Demo · not verified" : "Affiliate listing"}</span></td>`).join("")}</tr><tr><th scope="row">Retailer link</th>${selected.map(product => { const url = validAffiliateUrl(product); return `<td>${url && !product.demo ? `<a class="text-link" href="${escapeHTML(url)}" target="_blank" rel="nofollow sponsored noopener">View retailer ↗</a>` : "Not available"}</td>`; }).join("")}</tr></tbody></table></div>` : `<div class="empty-state compare-empty"><span class="empty-mark" aria-hidden="true">⇄</span><h2>Your comparison is empty</h2><p>Add products to compare from any product card.</p><a class="button button-primary" href="index.html">Explore finds</a></div>`}</div></section>`;
  setActiveNav("");
}

function renderInfo(page) {
  if (page === "contact") {
    main.innerHTML = `<section class="page-banner"><div class="wrap"><a class="breadcrumb" href="index.html">Home</a><span class="breadcrumb-divider">/</span><span>Contact</span><span class="eyebrow page-eyebrow">SAY HELLO</span><h1>We'd love to hear from you.</h1><p>Questions, product suggestions, or a note about a listing? Send us a message.</p></div></section><section class="section info-section"><div class="wrap contact-layout"><div><span class="eyebrow">GET IN TOUCH</span><h2>Good conversations<br>start here.</h2><p class="info-copy">SmartFinds PK is an independent discovery project. We're still setting up our public inbox, so this demo contact form saves a draft only in your browser and does not send a message.</p><p class="contact-note">No email inbox has been configured yet.</p></div><form class="contact-form" id="contact-form"><label for="contact-name">Your name</label><input id="contact-name" name="name" autocomplete="name" required maxlength="80"><label for="contact-email">Email address</label><input id="contact-email" name="email" type="email" autocomplete="email" required maxlength="120"><label for="contact-message">Message</label><textarea id="contact-message" name="message" rows="5" required maxlength="1500"></textarea><button class="button button-primary" type="submit">Save draft on this device <span aria-hidden="true">→</span></button><p class="form-status" id="form-status" aria-live="polite"></p></form></div></section>`;
    setActiveNav("");
    document.querySelector("#contact-form").addEventListener("submit", event => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      try {
        localStorage.setItem("smartfinds-contact-draft", JSON.stringify(Object.fromEntries(formData.entries())));
        document.querySelector("#form-status").textContent = "Draft saved in this browser. It has not been sent.";
      } catch {
        document.querySelector("#form-status").textContent = "Could not save this draft in your browser.";
      }
    });
    return;
  }
  const content = pages[page];
  if (!content) return renderHome();
  main.innerHTML = `<section class="page-banner"><div class="wrap"><a class="breadcrumb" href="index.html">Home</a><span class="breadcrumb-divider">/</span><span>${escapeHTML(content.eyebrow)}</span><span class="eyebrow page-eyebrow">${escapeHTML(content.eyebrow)}</span><h1>${escapeHTML(content.title)}</h1><p>${escapeHTML(content.body)}</p></div></section><section class="section info-section"><div class="wrap info-bottom"><span class="eyebrow">SMARTFINDS PK</span><a class="text-link" href="index.html">Back to the collection <span aria-hidden="true">→</span></a></div></section>`;
  setActiveNav("");
}

function setActiveNav(id) {
  document.querySelectorAll("[data-nav]").forEach(link => link.classList.toggle("is-active", link.dataset.nav === id));
}

function toggleCompare(id) {
  const ids = getCompareIds();
  if (ids.includes(id)) {
    setCompareIds(ids.filter(item => item !== id));
    showToast("Removed from comparison.");
  } else if (ids.length >= 4) {
    showToast("Compare up to 4 products at a time.");
  } else {
    setCompareIds([...ids, id]);
    showToast("Added to comparison.");
  }
  renderCurrentPage();
}

function renderCurrentPage() {
  if (query.has("product")) return renderDetail(query.get("product"));
  const page = query.get("page");
  if (page === "compare") return renderCompare();
  if (page && page !== "home") return renderInfo(page);
  if (query.has("category") || query.has("q")) return renderCatalog();
  renderHome();
}

document.querySelector("#search-form").addEventListener("submit", event => {
  event.preventDefault();
  const value = document.querySelector("#global-search").value.trim();
  location.href = value ? `?q=${encodeURIComponent(value)}` : "index.html";
});

document.querySelector("#menu-toggle").addEventListener("click", event => {
  const button = event.currentTarget;
  const expanded = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", String(!expanded));
  button.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
  document.querySelector("#category-nav").classList.toggle("is-open", !expanded);
});

document.addEventListener("click", event => {
  const compareButton = event.target.closest("[data-compare]");
  if (compareButton) return toggleCompare(compareButton.dataset.compare);
  const removeButton = event.target.closest("[data-remove-compare]");
  if (removeButton) {
    setCompareIds(getCompareIds().filter(id => id !== removeButton.dataset.removeCompare));
    renderCompare();
    return;
  }
  if (event.target.closest("[data-clear-compare]")) {
    setCompareIds([]);
    renderCompare();
  }
});

document.querySelector("#current-year").textContent = new Date().getFullYear();
updateCompareCount();
fetch("products.json").then(response => {
  if (!response.ok) throw new Error("Catalog request failed");
  return response.json();
}).then(data => {
  if (!Array.isArray(data)) throw new Error("Catalog format is invalid");
  products = data.filter(product => product && typeof product.id === "string" && typeof product.name === "string");
  renderCurrentPage();
}).catch(() => {
  main.innerHTML = `<section class="section"><div class="wrap empty-state"><span class="eyebrow">CATALOG UNAVAILABLE</span><h1>We couldn't load the finds.</h1><p>Serve the project over HTTP and check that <code>products.json</code> is available.</p></div></section>`;
});