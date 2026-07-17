(function installShopifyTrackingBridge() {
  "use strict";

  const CHECKOUT_BASE = "https://gaiety-6507.myshopify.com/cart/64213500100977:1";
  const FIRST_TOUCH_KEY = "fbads_conversion_tracker_first_touch";
  const SESSION_ATTRIBUTION_KEY = "fbads_conversion_tracker_session_attribution";

  function parseStoredJson(storage, key) {
    try {
      const value = storage.getItem(key);
      return value ? JSON.parse(value) : {};
    } catch (_error) {
      return {};
    }
  }

  function attribution() {
    const params = new URLSearchParams(window.location.search);
    const firstTouch = parseStoredJson(window.localStorage, FIRST_TOUCH_KEY);
    const sessionTouch = parseStoredJson(window.sessionStorage, SESSION_ATTRIBUTION_KEY);
    const current = {};

    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"].forEach((key) => {
      const value = params.get(key);
      if (value) current[key] = value;
    });

    return Object.assign({}, firstTouch, sessionTouch, current);
  }

  function urlSafeBase64(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = "";

    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function setAttribute(url, key, value) {
    if (value === null || value === undefined || value === "") return;
    url.searchParams.set(`attributes[${key}]`, String(value).slice(0, 240));
  }

  function buildCheckoutUrl(tracker) {
    const url = new URL(CHECKOUT_BASE);
    const source = attribution();
    const identity = {
      _ct_visitor_id: tracker?.visitorId || "",
      _ct_session_id: tracker?.sessionId || "",
      _ct_utm_source: source.utm_source || "",
      _ct_utm_medium: source.utm_medium || "",
      _ct_utm_campaign: source.utm_campaign || "",
      _ct_utm_content: source.utm_content || "",
      _ct_utm_term: source.utm_term || "",
      _ct_fbclid: source.fbclid || "",
    };

    url.searchParams.set("ref", "gaiety-landing");
    setAttribute(url, "ct_origin", "gaiety-landing");
    setAttribute(url, "ct_visitor_id", identity._ct_visitor_id);
    setAttribute(url, "ct_session_id", identity._ct_session_id);
    setAttribute(url, "ct_utm_source", identity._ct_utm_source);
    setAttribute(url, "ct_utm_medium", identity._ct_utm_medium);
    setAttribute(url, "ct_utm_campaign", identity._ct_utm_campaign);
    setAttribute(url, "ct_utm_content", identity._ct_utm_content);
    setAttribute(url, "ct_utm_term", identity._ct_utm_term);
    setAttribute(url, "ct_fbclid", identity._ct_fbclid);
    url.searchParams.set("properties", urlSafeBase64(JSON.stringify(identity)));

    return url.toString();
  }

  function isCheckoutLink(link) {
    if (!(link instanceof HTMLAnchorElement)) return false;

    try {
      const url = new URL(link.href, window.location.href);
      return url.hostname === "gaiety-6507.myshopify.com" && url.pathname.startsWith("/cart/64213500100977:1");
    } catch (_error) {
      return false;
    }
  }

  function placement(link) {
    if (link.classList.contains("header-buy")) return "header";
    if (link.classList.contains("hero-buy-primary")) return "hero";
    if (link.classList.contains("buy-button")) return "offer";
    if (link.closest(".mobile-buy")) return "mobile_sticky";
    if (link.classList.contains("desktop-buy-dock")) return "desktop_dock";
    if (link.closest(".menu-panel")) return "menu";
    return "unknown";
  }

  function waitForTracker() {
    return new Promise((resolve) => {
      let attempts = 0;
      const check = () => {
        if (window.ConversionTracker) {
          resolve(window.ConversionTracker);
          return;
        }
        attempts += 1;
        if (attempts >= 30) {
          resolve(null);
          return;
        }
        window.setTimeout(check, 50);
      };
      check();
    });
  }

  window.addEventListener(
    "pointerdown",
    (event) => {
      const link = event.target?.closest?.("a");
      if (!isCheckoutLink(link) || !window.ConversionTracker) return;
      link.href = buildCheckoutUrl(window.ConversionTracker);
    },
    true,
  );

  window.addEventListener(
    "click",
    (event) => {
      const link = event.target?.closest?.("a");
      if (!isCheckoutLink(link)) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      waitForTracker().then((tracker) => {
        const destination = buildCheckoutUrl(tracker);
        const properties = {
          product_id: "gaiety-classic",
          variant_id: "64213500100977",
          product_name: "GAIETY Classic",
          price: 169,
          currency: "BRL",
          quantity: 1,
          placement: placement(link),
          cart_method: "shopify_cart_permalink_with_properties",
        };

        if (!tracker) {
          window.location.assign(destination);
          return;
        }

        Promise.all([
          tracker.track("buy_button_click", properties),
          tracker.track("add_to_cart", properties),
        ]).finally(() => window.location.assign(destination));
      });
    },
    true,
  );
})();

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* This layer never hides or rewrites copy. */
  root.classList.remove("ds-motion-active");
  document.querySelectorAll(".reveal").forEach((element) => {
    element.classList.add("is-visible", "in-view");
  });

  /* Active chapter indicator */
  const indicator = document.querySelector("[data-chapter-indicator]");
  const chapterNumber = indicator?.querySelector("[data-chapter-number]");
  const chapterTitle = indicator?.querySelector("[data-chapter-title]");
  const chapters = [...document.querySelectorAll("[data-chapter]")];

  let chapterTicking = false;
  const updateChapter = () => {
    if (!indicator || !chapters.length) return;

    const target = window.innerHeight * 0.48;
    let active = chapters[0];
    let bestDistance = Number.POSITIVE_INFINITY;

    chapters.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      const center = Math.min(Math.max(target, rect.top), rect.bottom);
      const distance = Math.abs(center - target);
      if (distance < bestDistance) {
        bestDistance = distance;
        active = section;
      }
    });

    if (chapterNumber) chapterNumber.textContent = active.dataset.chapter || "00";
    if (chapterTitle) chapterTitle.textContent = active.dataset.chapterTitle || "GAIETY";

    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    indicator.style.setProperty("--chapter-progress", Math.min(1, Math.max(0, window.scrollY / scrollable)).toFixed(4));
    chapterTicking = false;
  };

  const requestChapterUpdate = () => {
    if (chapterTicking) return;
    chapterTicking = true;
    requestAnimationFrame(updateChapter);
  };

  updateChapter();
  window.addEventListener("scroll", requestChapterUpdate, { passive: true });
  window.addEventListener("resize", requestChapterUpdate, { passive: true });

  /* Holodex pointer response */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".holodex-card").forEach((card) => {
      const image = card.querySelector("img");

      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--holodex-light-x", `${(x + 0.5) * 100}%`);
        card.style.setProperty("--holodex-light-y", `${(y + 0.5) * 100}%`);
        if (image) image.style.transform = `scale(1.035) translate3d(${x * 5}px, ${y * 5}px, 0)`;
      });

      card.addEventListener("pointerleave", () => {
        if (image) image.style.removeProperty("transform");
      });
    });
  }

  /* Restrained particle mechanism in the hero */
  const canvas = document.querySelector("[data-nexus]");
  const hero = canvas?.closest(".hero");
  const canAnimate = canvas && hero && !reduceMotion && window.innerWidth > 560;

  if (!canAnimate) return;

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let frame = 0;
  let heroVisible = true;
  let pointerX = 0.72;
  let pointerY = 0.48;

  const particleCount = window.innerWidth > 1100 ? 42 : 28;
  const particles = Array.from({ length: particleCount }, (_, index) => ({
    x: 0.48 + Math.random() * 0.5,
    y: 0.08 + Math.random() * 0.84,
    radius: index % 8 === 0 ? 1.4 : 0.7 + Math.random() * 0.65,
    drift: 0.00018 + Math.random() * 0.0003,
    phase: Math.random() * Math.PI * 2,
  }));

  const resizeCanvas = () => {
    const rect = hero.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = (time) => {
    frame = requestAnimationFrame(draw);
    if (!heroVisible || document.hidden) return;

    context.clearRect(0, 0, width, height);
    const points = particles.map((particle) => {
      const orbit = time * particle.drift + particle.phase;
      return {
        x: (particle.x + Math.cos(orbit) * 0.012) * width,
        y: (particle.y + Math.sin(orbit * 0.83) * 0.018) * height,
        radius: particle.radius,
      };
    });

    points.forEach((point, index) => {
      const cursorDistance = Math.hypot(point.x / width - pointerX, point.y / height - pointerY);
      const glow = Math.max(0, 1 - cursorDistance * 2.7);

      context.beginPath();
      context.arc(point.x, point.y, point.radius + glow * 0.7, 0, Math.PI * 2);
      context.fillStyle = `rgba(230,211,165,${0.18 + glow * 0.34})`;
      context.fill();

      for (let next = index + 1; next < points.length; next += 1) {
        const other = points[next];
        const distance = Math.hypot(point.x - other.x, point.y - other.y);
        const limit = Math.min(145, width * 0.12);
        if (distance > limit) continue;

        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(other.x, other.y);
        context.strokeStyle = `rgba(199,167,101,${(1 - distance / limit) * 0.105})`;
        context.lineWidth = 0.65;
        context.stroke();
      }
    });

    const cursorPxX = pointerX * width;
    const cursorPxY = pointerY * height;
    const radial = context.createRadialGradient(cursorPxX, cursorPxY, 0, cursorPxX, cursorPxY, Math.min(width, height) * 0.18);
    radial.addColorStop(0, "rgba(199,167,101,.075)");
    radial.addColorStop(1, "rgba(199,167,101,0)");
    context.fillStyle = radial;
    context.fillRect(0, 0, width, height);
  };

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    pointerX = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    pointerY = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
  }, { passive: true });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      heroVisible = Boolean(entries[0]?.isIntersecting);
    }, { threshold: 0.02 });
    observer.observe(hero);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas, { passive: true });
  frame = requestAnimationFrame(draw);
  window.addEventListener("pagehide", () => cancelAnimationFrame(frame), { once: true });
});