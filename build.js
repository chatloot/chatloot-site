const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://chatloot.co';
const SITE_NAME = 'ChatLoot';
const SITE_TAGLINE = 'Assets for Twitch Streamers - Available for Instant Download through Etsy';

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

const products = JSON.parse(fs.readFileSync(path.join(ROOT, 'products.json'), 'utf8'));

function getCategories(product) {
  if (!product.category) return [];
  return Array.isArray(product.category) ? product.category : [product.category];
}

// Parses "£8.50" -> { symbol: "£", amount: "8.50", currency: "GBP" }
function parsePrice(priceStr) {
  const match = String(priceStr).match(/^([^\d]*)([\d.,]+)/);
  const symbol = match ? match[1].trim() : '';
  const amount = match ? match[2].replace(',', '') : '0';
  const currencyMap = { '£': 'GBP', '$': 'USD', '€': 'EUR' };
  return { amount, currency: currencyMap[symbol] || 'GBP' };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pageShell({ title, description, canonicalPath, ogImage, bodyHtml, extraHead = '' }) {
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${canonicalUrl}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
${ogImage ? `<meta property="og:image" content="${SITE_URL}/${ogImage}">` : ''}
<meta property="og:url" content="${canonicalUrl}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
${extraHead}
</head>
<body>
<header class="site-header">
  <div class="wrap header-inner">
    <a href="/" class="logo">
      <span class="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="26" height="26">
          <circle cx="16" cy="16" r="13" fill="none" stroke-width="3" class="logo-a" style="stroke: var(--accent-gold)"/>
          <path d="M10 17 L14 21 L22 12" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="logo-b" style="stroke: var(--accent-violet)"/>
        </svg>
      </span>
      ${SITE_NAME}
    </a>
    <p class="tagline">${SITE_TAGLINE}</p>
  </div>
</header>
${bodyHtml}
<footer class="site-footer">
  <div class="wrap">
    <p>${SITE_NAME} &middot; Twitch overlays and assets, delivered instantly via Etsy.</p>
  </div>
</footer>
<script src="/client.js"></script>
</body>
</html>
`;
}

function cardHtml(product) {
  const cats = getCategories(product);
  const hasThumb = !!product.thumbnail;
  const hoverVideo = (product.videoUrl && /\.(mp4|webm)$/i.test(product.videoUrl))
    ? `<video class="card-hover-video" data-src="/${product.videoUrl}" muted loop playsinline preload="none"></video>`
    : '';
  const playPill = product.videoUrl
    ? `<span class="play-pill"><span class="dot"></span>Watch preview</span>`
    : (product.gallery ? `<span class="play-pill"><span class="dot"></span>View photos</span>` : '');

  return `
    <a class="card" href="/products/${product.id}.html" data-categories="${cats.join('|')}">
      <div class="card-media">
        ${hasThumb
          ? `<img src="/${product.thumbnail}" alt="${escapeHtml(product.title)}" loading="lazy">`
          : `<div class="no-thumb">${escapeHtml(product.title.slice(0, 1))}</div>`}
        ${hoverVideo}
        ${playPill}
      </div>
      <div class="card-body">
        <p class="card-category">${escapeHtml(cats.join(' · '))}</p>
        <h3>${escapeHtml(product.title)}</h3>
        <p class="card-blurb">${escapeHtml(product.blurb)}</p>
        <div class="card-footer">
          <span class="card-price">${escapeHtml(product.price)}</span>
          <span class="card-cta">${product.videoUrl ? 'Preview' : (product.gallery ? 'Photos' : 'Details')}</span>
        </div>
        <p class="price-note">See Etsy price for your local currency and discounts</p>
      </div>
    </a>
  `;
}

function buildHomepage() {
  const categories = ['All', ...new Set(products.flatMap(getCategories))];
  const filterHtml = categories.map(cat =>
    `<button class="filter-btn ${cat === 'All' ? 'active' : ''}" data-cat="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`
  ).join('');

  const bodyHtml = `
<section class="hero">
  <div class="wrap hero-inner">
    <p class="eyebrow">Twitch assets &amp; overlays</p>
    <h1>Level-Up Your Stream</h1>
    <p class="hero-sub">Explore a variety of stream-ready widgets, browser-source overlays and more; designed to add charm and interactivity to your channel. From soft and cozy visuals to more vibrant or dynamic designs, everything is built to work seamlessly with OBS, Streamlabs, and other browser-source setups.</p>
  </div>
</section>
<nav class="filter-bar" aria-label="Filter by category">
  <div class="wrap filter-inner" id="filterBar">${filterHtml}</div>
</nav>
<main class="wrap">
  <div class="catalog-grid" id="catalogGrid">
    ${products.map(cardHtml).join('')}
  </div>
</main>
`;

  return pageShell({
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: 'Browse our range of Twitch streamer assets and overlays — all available for instant download on Etsy in your local currency.',
    canonicalPath: '/',
    ogImage: products[0] && products[0].thumbnail,
    bodyHtml,
  });
}

function buildProductPage(product) {
  const { amount, currency } = parsePrice(product.price);
  const cats = getCategories(product);

  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    description: product.description || product.blurb,
    image: product.thumbnail ? `${SITE_URL}/${product.thumbnail}` : undefined,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      url: product.etsyUrl,
      priceCurrency: currency,
      price: amount,
      availability: 'https://schema.org/InStock',
    },
  };

  const extraHead = `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;

  const bodyHtml = `
<main class="wrap">
  <div class="product-page">
    <div class="product-media">
      <div class="media-frame" id="mediaFrame">
        <div class="media-content" id="mediaContent">
          ${product.thumbnail ? `<img src="/${product.thumbnail}" alt="${escapeHtml(product.title)}">` : ''}
        </div>
        <button class="gallery-nav gallery-prev" id="galleryPrev" aria-label="Previous item" hidden>&#8249;</button>
        <button class="gallery-nav gallery-next" id="galleryNext" aria-label="Next item" hidden>&#8250;</button>
        <span class="gallery-count" id="galleryCount" hidden></span>
      </div>
      <div class="gallery-thumbs" id="galleryThumbs" hidden></div>
    </div>
    <div class="product-info">
      <p class="eyebrow">${escapeHtml(cats.join(' · '))}</p>
      <h1>${escapeHtml(product.title)}</h1>
      <p class="product-desc">${escapeHtml(product.description || product.blurb)}</p>
      <div class="tag-row">${(product.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
      <a class="btn-etsy" href="${product.etsyUrl}" target="_blank" rel="noopener noreferrer">
        <span>Get it on Etsy</span>
        <span class="btn-price">${escapeHtml(product.price)}</span>
      </a>
      <p class="price-note">Check Etsy for current price and offers. Price on Etsy will be in your local currency.</p>
    </div>
  </div>
  <a class="back-link" href="/">&larr; Back to all overlays</a>
</main>
<script type="application/json" id="product-data">${JSON.stringify(product)}</script>
`;

  return pageShell({
    title: `${product.title} — ${SITE_NAME}`,
    description: product.blurb,
    canonicalPath: `/products/${product.id}.html`,
    ogImage: product.thumbnail,
    bodyHtml,
    extraHead,
  });
}

function buildSitemap() {
  const urls = [
    `${SITE_URL}/`,
    ...products.map(p => `${SITE_URL}/products/${p.id}.html`),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`;
}

function buildRobots() {
  return `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}

// ---------- Run ----------

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'products'), { recursive: true });

fs.writeFileSync(path.join(DIST, 'index.html'), buildHomepage());
products.forEach(product => {
  fs.writeFileSync(path.join(DIST, 'products', `${product.id}.html`), buildProductPage(product));
});
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), buildSitemap());
fs.writeFileSync(path.join(DIST, 'robots.txt'), buildRobots());

fs.copyFileSync(path.join(ROOT, 'styles.css'), path.join(DIST, 'styles.css'));
fs.copyFileSync(path.join(ROOT, 'client.js'), path.join(DIST, 'client.js'));

// Copy the assets folder if it exists (product images/videos)
const assetsSrc = path.join(ROOT, 'assets');
if (fs.existsSync(assetsSrc)) {
  fs.cpSync(assetsSrc, path.join(DIST, 'assets'), { recursive: true });
}

console.log(`Built ${products.length} product pages + homepage into /dist`);