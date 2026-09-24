# ChatLoot Site

Rebuilt for real Google indexing: every product now has its own static,
crawlable HTML page — no more single-page JS-rendered catalog.

## How it works

- **`products.json`** — your product data (edit this, same as before)
- **`build.js`** — reads `products.json` and generates the whole site into
  `dist/`: the homepage, one HTML file per product under `dist/products/`,
  `sitemap.xml`, and `robots.txt`
- **`styles.css`** / **`client.js`** — shared stylesheet and browser-side
  enhancement script, copied into `dist/` by the build
- **`assets/`** — put product images/videos here (same numbered-gallery
  convention as before: `assets/<product-id>/01.png`, `02.png`, etc.). The
  build copies this whole folder into `dist/assets/` automatically.

## The key difference from the old site

Each product page now ships with **real, crawlable content already in the
HTML** — the title, description, price, main image, and the "Get it on
Etsy" link are all server-rendered, not injected by JavaScript after the
page loads. `client.js` then *enhances* that static page into the full
photo/video carousel — but if a crawler (or a browser with JS disabled)
only sees the raw HTML, there's still a real page with real content and a
real link to Etsy. That's what makes individual products indexable.

The homepage works the same way: the full product grid with real
`<a href="/products/...">` links is in the raw HTML, so Google can discover
every product page just by reading the homepage — no JavaScript execution
required for that part.

## Running the build

```bash
node build.js
```

No dependencies to install — pure Node, uses only built-in modules. Re-run
this any time you change `products.json`, `styles.css`, or `client.js`,
then re-deploy the `dist/` folder.

## Adding a product

Same shape as before, in `products.json`:

```json
{
  "id": "unique-slug",
  "title": "Product name",
  "category": "Overlays",
  "price": "£8.00",
  "blurb": "One sentence shown on the card and as the page's meta description.",
  "description": "Longer description shown on the product page. \\n for line breaks.",
  "thumbnail": "assets/unique-slug/01.png",
  "videoUrl": "https://www.youtube.com/embed/VIDEO_ID (or a local .mp4/.webm path)",
  "gallery": { "folder": "assets/unique-slug", "count": 4 },
  "etsyUrl": "https://www.etsy.com/...?utm_source=chatloot_site&utm_medium=referral&utm_campaign=catalog",
  "tags": ["Tag One", "Tag Two"]
}
```

`category` also accepts an array (`["Overlays", "Alerts"]`) for products
that belong in more than one filter.

The `id` becomes the URL: `id: "loot-drop-alert"` → page lives at
`/products/loot-drop-alert.html`. Once set, try not to change it — that's
the URL Google will eventually index, and changing it later means losing
whatever ranking it's built up (set up a redirect if you ever do need to
rename one).

## Deploying

**If Netlify is connected to a git repo:** just push. `netlify.toml` tells
Netlify to run `node build.js` and publish `dist/` automatically on every
deploy — no manual build step needed.

**If deploying manually (drag-and-drop):** run `node build.js` yourself
first, then drag the `dist/` folder (not the project root) into Netlify.

## After each deploy

- Resubmit `sitemap.xml` in Search Console if you've added new products
  (Search Console → Sitemaps — it'll pick up new URLs automatically once
  crawled, but a resubmit nudges it to check sooner)
- Use **URL Inspection → Request Indexing** on any new product page you
  want looked at quickly rather than waiting for organic crawl discovery

## What got carried over from the old build

- The photo → video → more-photos carousel order (Etsy-style)
- Auto-looping video (both self-hosted mp4/webm and YouTube embeds)
- Numbered-gallery auto-extension-detection (`01.png`/`01.jpg`/etc.)
- Hover-preview video on desktop cards (debounced, unloads on mouse-leave)
- "Price may be lower on Etsy" disclaimer
- Multi-category support
- The history-state fix so mobile back-swipe closes things properly (N/A
  here in the same way, since there's no lightbox anymore — but the
  equivalent concern doesn't apply: product pages are real pages, so
  back/swipe navigation just works natively)

## Placeholder data

The three products in `products.json` right now are placeholders — swap in
your real ChatLoot Etsy listings (titles, descriptions, real Etsy URLs,
real images in `assets/`) before this goes live for real.
