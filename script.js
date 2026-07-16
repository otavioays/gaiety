document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Text must never depend on animation state. */
  root.classList.remove("motion-ready", "ds-motion-active");
  body.classList.add("is-loaded");
  document.querySelectorAll(".reveal").forEach((element) => {
    element.classList.add("is-visible", "in-view");
  });

  /* Remove word masks left by older cached versions without touching <br> tags. */
  document.querySelectorAll(".word-mask").forEach((mask) => {
    mask.replaceWith(document.createTextNode(mask.textContent || ""));
  });
  document.querySelectorAll("[data-words-ready]").forEach((element) => {
    element.removeAttribute("data-words-ready");
    element.removeAttribute("aria-label");
  });

  if (finePointer) root.classList.add("has-fine-pointer");

  const createLayer = (className) => {
    const existing = document.querySelector(`.${className}`);
    if (existing) return existing;
    const layer = document.createElement("div");
    layer.className = className;
    layer.setAttribute("aria-hidden", "true");
    body.prepend(layer);
    return layer;
  };

  const scrollProgress = createLayer("scroll-progress");
  const cursorOrb = finePointer ? createLayer("cursor-orb") : null;
  const motionGrid = finePointer ? createLayer("motion-grid") : null;

  const header = document.querySelector("[data-header]");
  const menu = document.querySelector("[data-menu]");
  const backdrop = document.querySelector("[data-menu-backdrop]");
  const openButton = document.querySelector("[data-menu-open]");
  const closeButton = document.querySelector("[data-menu-close]");

  /* Conversion-forward purchase controls. These point to the offer until the
     final Shopify checkout URL is supplied. */
  const headerBuy = document.querySelector(".header-buy");
  if (headerBuy) headerBuy.textContent = "Comprar · R$ 169";

  const heroCopy = document.querySelector(".hero-copy");
  if (heroCopy && !heroCopy.querySelector(".hero-actions")) {
    const oldDiscoveryLink = heroCopy.querySelector(".text-link");
    const actions = document.createElement("div");
    actions.className = "hero-actions";
    actions.innerHTML = `
      <a class="hero-buy-primary" href="#comprar" aria-label="Comprar GAIETY Classic por R$ 169">
        <span>Comprar GAIETY Classic</span><strong>R$ 169</strong>
      </a>
      <a class="hero-discover" href="#classic">Ver detalhes</a>
    `;
    oldDiscoveryLink?.replaceWith(actions);
    if (!oldDiscoveryLink) heroCopy.appendChild(actions);
  }

  if (!document.querySelector(".desktop-buy-dock")) {
    const dock = document.createElement("a");
    dock.className = "desktop-buy-dock";
    dock.href = "#comprar";
    dock.setAttribute("aria-label", "Ir para a oferta do GAIETY Classic por R$ 169");
    dock.innerHTML = `<div><span>GAIETY Classic</span><strong>R$ 169,00</strong></div><b>Comprar agora →</b>`;
    body.appendChild(dock);
  }

  const mobileBuyLabel = document.querySelector(".mobile-buy a");
  if (mobileBuyLabel) mobileBuyLabel.textContent = "Comprar agora";

  menu?.querySelectorAll("nav a").forEach((link, index) => {
    link.style.setProperty("--menu-index", index);
  });

  const openMenu = () => {
    menu?.classList.add("is-open");
    backdrop?.classList.add("is-open");
    menu?.setAttribute("aria-hidden", "false");
    openButton?.setAttribute("aria-expanded", "true");
    body.classList.add("menu-open");
    closeButton?.focus();
  };

  const closeMenu = () => {
    menu?.classList.remove("is-open");
    backdrop?.classList.remove("is-open");
    menu?.setAttribute("aria-hidden", "true");
    openButton?.setAttribute("aria-expanded", "false");
    body.classList.remove("menu-open");
  };

  openButton?.addEventListener("click", openMenu);
  closeButton?.addEventListener("click", closeMenu);
  backdrop?.addEventListener("click", closeMenu);
  menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateScrollEffects = () => {
    const y = window.scrollY;
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, y / scrollable));

    root.style.setProperty("--scroll-progress", progress.toFixed(4));
    if (scrollProgress) scrollProgress.style.transform = `scaleX(${progress})`;

    if (header) {
      header.classList.toggle("is-solid", y > 40);
      const movingDown = y > lastScrollY && y > 220;
      header.classList.toggle("is-hidden", movingDown && Math.abs(y - lastScrollY) > 3);
    }

    if (!reduceMotion) {
      const cinematic = document.querySelector(".cinematic");
      const cinematicImage = document.querySelector(".cinematic-inner > img");
      if (cinematic && cinematicImage) {
        const rect = cinematic.getBoundingClientRect();
        const total = Math.max(1, cinematic.offsetHeight - window.innerHeight);
        const localProgress = Math.min(1, Math.max(0, -rect.top / total));
        cinematicImage.style.setProperty("--cinematic-y", `${(localProgress - 0.5) * 38}px`);
        cinematicImage.style.setProperty("--cinematic-scale", `${1.31 - localProgress * 0.16}`);
      }

      const offer = document.querySelector(".offer");
      const offerImage = document.querySelector(".offer-image img");
      if (offer && offerImage) {
        const rect = offer.getBoundingClientRect();
        const local = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
        offerImage.style.setProperty("--offer-y", `${(local - 0.5) * 28}px`);
      }
    }

    lastScrollY = y;
    ticking = false;
  };

  const requestScrollUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScrollEffects);
  };

  updateScrollEffects();
  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate, { passive: true });

  document.querySelectorAll(".faq-list details").forEach((details) => {
    details.addEventListener("toggle", () => {
      if (!details.open) return;
      document.querySelectorAll(".faq-list details").forEach((other) => {
        if (other !== details) other.open = false;
      });
    });
  });

  if (finePointer && !reduceMotion) {
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let orbX = pointerX;
    let orbY = pointerY;

    const renderPointer = () => {
      orbX += (pointerX - orbX) * 0.12;
      orbY += (pointerY - orbY) * 0.12;
      root.style.setProperty("--cursor-x-px", `${orbX}px`);
      root.style.setProperty("--cursor-y-px", `${orbY}px`);
      requestAnimationFrame(renderPointer);
    };
    renderPointer();

    window.addEventListener("pointermove", (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      root.style.setProperty("--cursor-x", `${(event.clientX / window.innerWidth) * 100}%`);
      root.style.setProperty("--cursor-y", `${(event.clientY / window.innerHeight) * 100}%`);
      root.style.setProperty("--grid-x", `${50 + (event.clientX / window.innerWidth - 0.5) * 2}%`);
      root.style.setProperty("--grid-y", `${50 + (event.clientY / window.innerHeight - 0.5) * 2}%`);
    }, { passive: true });

    document.querySelectorAll(".bento > *").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--tilt-x", `${-y * 4.5}deg`);
        card.style.setProperty("--tilt-y", `${x * 5.5}deg`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
    });

    document.querySelectorAll(".header-buy, .buy-button, .text-link, .mobile-buy a, .hero-buy-primary, .desktop-buy-dock").forEach((target) => {
      target.addEventListener("pointermove", (event) => {
        const rect = target.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        target.style.setProperty("--magnetic-x", `${x * 0.1}px`);
        target.style.setProperty("--magnetic-y", `${y * 0.12}px`);
      });
      target.addEventListener("pointerleave", () => {
        target.style.setProperty("--magnetic-x", "0px");
        target.style.setProperty("--magnetic-y", "0px");
      });
    });
  }

  const checkoutUrl = "https://seu-checkout.com";
  document.querySelectorAll(".checkout-link").forEach((link) => {
    link.href = checkoutUrl;
  });

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* A final safety pass catches late stylesheet or cached-script interference. */
  requestAnimationFrame(() => {
    root.classList.remove("motion-ready", "ds-motion-active");
    document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible", "in-view"));
  });
});
