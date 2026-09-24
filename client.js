(function () {
  const GALLERY_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif'];

  function isMp4(url) {
    return /\.(mp4|webm)$/i.test(url || '');
  }

  function loadImageVariant(basePath) {
    return new Promise((resolve) => {
      let i = 0;
      const tryNext = () => {
        if (i >= GALLERY_EXTENSIONS.length) return resolve(null);
        const src = `${basePath}.${GALLERY_EXTENSIONS[i]}`;
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => { i += 1; tryNext(); };
        img.src = src;
      };
      tryNext();
    });
  }

  async function resolveGallery(gallery) {
    if (!gallery) return [];
    const { folder, count } = gallery;
    const slots = Array.from({ length: count }, (_, i) => String(i + 1).padStart(2, '0'));
    const results = await Promise.all(slots.map(slot => loadImageVariant(`${folder}/${slot}`)));
    return results.filter(Boolean);
  }

  function extractYouTubeId(embedUrl) {
    const match = embedUrl.match(/\/embed\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }

  function buildMediaItems(product, galleryImages) {
    const items = [];
    if (galleryImages.length) {
      items.push({ type: 'image', src: galleryImages[0] });
      if (product.videoUrl) items.push({ type: 'video', src: product.videoUrl });
      for (let i = 1; i < galleryImages.length; i += 1) {
        items.push({ type: 'image', src: galleryImages[i] });
      }
    } else if (product.videoUrl) {
      items.push({ type: 'video', src: product.videoUrl });
    } else if (product.thumbnail) {
      items.push({ type: 'image', src: product.thumbnail });
    }
    return items;
  }

  // ---------- Product page: enhance the static hero image into a full carousel ----------
  function initProductCarousel() {
    const dataEl = document.getElementById('product-data');
    if (!dataEl) return;
    const product = JSON.parse(dataEl.textContent);

    const frame = document.getElementById('mediaFrame');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');
    const countEl = document.getElementById('galleryCount');
    const thumbsEl = document.getElementById('galleryThumbs');
    if (!frame) return;

    let items = [];
    let index = 0;

    function renderItem() {
      const item = items[index];
      if (!item) return;
      if (item.type === 'video') {
        if (isMp4(item.src)) {
          frame.innerHTML = `<video src="${item.src}" autoplay muted loop playsinline controls></video>`;
        } else {
          const videoId = extractYouTubeId(item.src);
          const loopParams = videoId ? `&loop=1&playlist=${videoId}` : '';
          frame.innerHTML = `<iframe src="${item.src}?autoplay=1&mute=1${loopParams}" title="${product.title} preview" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        }
      } else {
        frame.innerHTML = `<img src="${item.src}" alt="${product.title}">`;
      }

      const multi = items.length > 1;
      prevBtn.hidden = !multi;
      nextBtn.hidden = !multi;
      countEl.hidden = !multi;
      countEl.textContent = `${index + 1} / ${items.length}`;
      thumbsEl.hidden = !multi;

      if (multi) {
        thumbsEl.innerHTML = items.map((it, i) => {
          const isVideo = it.type === 'video';
          const thumbSrc = isVideo ? (product.thumbnail || it.src) : it.src;
          const badge = isVideo ? `<span class="thumb-play" aria-hidden="true">&#9654;</span>` : '';
          return `<button class="gallery-thumb ${i === index ? 'active' : ''}" data-index="${i}" aria-label="${isVideo ? 'Preview video' : `Photo ${i + 1}`}"><img src="${thumbSrc}" alt="">${badge}</button>`;
        }).join('');
        thumbsEl.querySelectorAll('.gallery-thumb').forEach(btn => {
          btn.addEventListener('click', () => { index = Number(btn.dataset.index); renderItem(); });
        });
      }
    }

    function step(delta) {
      if (!items.length) return;
      index = (index + delta + items.length) % items.length;
      renderItem();
    }

    prevBtn.addEventListener('click', () => step(-1));
    nextBtn.addEventListener('click', () => step(1));
    document.addEventListener('keydown', (e) => {
      if (items.length < 2) return;
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });

    resolveGallery(product.gallery).then((galleryImages) => {
      items = buildMediaItems(product, galleryImages);
      index = 0;
      if (items.length) renderItem();
    });
  }

  // ---------- Homepage: category filter + hover-preview video ----------
  function initHomepage() {
    const filterBar = document.getElementById('filterBar');
    const grid = document.getElementById('catalogGrid');
    if (!filterBar || !grid) return;

    const cards = Array.from(grid.querySelectorAll('.card'));

    filterBar.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        cards.forEach(card => {
          const cardCats = (card.dataset.categories || '').split('|');
          card.style.display = (cat === 'All' || cardCats.includes(cat)) ? '' : 'none';
        });
      });
    });

    const supportsHoverPreview =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!supportsHoverPreview) return;

    cards.forEach(card => {
      const videoEl = card.querySelector('.card-hover-video');
      if (!videoEl) return;
      let hoverTimer = null;

      card.addEventListener('mouseenter', () => {
        hoverTimer = setTimeout(() => {
          videoEl.src = videoEl.dataset.src;
          videoEl.play().catch(() => {});
          videoEl.classList.add('is-active');
        }, 350);
      });

      card.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimer);
        videoEl.classList.remove('is-active');
        videoEl.pause();
        videoEl.removeAttribute('src');
        videoEl.load();
      });
    });
  }

  initProductCarousel();
  initHomepage();
})();
