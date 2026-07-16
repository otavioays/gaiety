document.documentElement.classList.add("motion-ready");

(() => {
  const motionStyles = document.createElement("link");
  motionStyles.rel = "stylesheet";
  motionStyles.href = "motion.css";
  document.head.appendChild(motionStyles);
})();

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (finePointer) root.classList.add("has-fine-pointer");

  const parts = [
    window.GAIETY_HERO_PART1,
    window.GAIETY_HERO_PART2,
    window.GAIETY_HERO_PART3,
  ].filter(Boolean);

  if (parts.length === 3) {
    const src = `data:image/webp;base64,${parts.join("")}`;
    document.querySelectorAll("[data-gaiety-image]").forEach((image) => {
      image.src = src;
    });
  }

  const motionGrid = document.createElement("div");
  motionGrid.className = "motion-grid";
  motionGrid.setAttribute("aria-hidden", "true");

  const cursorOrb = document.createElement("div");
  cursorOrb.className = "cursor-orb";
  cursorOrb.setAttribute("aria-hidden", "true");

  const scrollProgress = document.createElement("div");
  scrollProgress.className = "scroll-progress";
  scrollProgress.setAttribute("aria-hidden", "true");

  body.prepend(scrollProgress, cursorOrb, motionGrid);

  requestAnimationFrame(() => body.classList.add("is-loaded"));

  const header = document.querySelector("[data-header]");
  const menu = document.querySelector("[data-menu]");
  const backdrop = document.querySelector("[data-menu-backdrop]");
  const openButton = document.querySelector("[data-menu-open]");
  const closeButton = document.querySelector("[data-menu-close]");

  menu?.querySelectorAll("nav a").forEach((link, index) => {
    link.style.setProperty("--menu-index", index);
  });

  let lastScrollY = window.scrollY;
  let ticking = false;
  let scrollVelocity = 0;

  const updateScrollEffects = () => {
    const y = window.scrollY;
    const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, y / docHeight));

    root.style.setProperty("--scroll-progress", progress.toFixed(4));

    if (header) {
      header.classList.toggle("is-solid", y > 40);
      const movingDown = y > lastScrollY && y > 180;
      header.classList.toggle("is-hidden", movingDown && Math.abs(y - lastScrollY) > 2);
    }

    scrollVelocity = Math.min(14, Math.abs(y - lastScrollY));
    root.style.setProperty("--marquee-duration", `${Math.max(15, 23 - scrollVelocity * .28)}s`);

    if (!reduceMotion) {
      const heroImage = document.querySelector(".hero-image");
      if (heroImage) {
        const heroProgress = Math.min(1, y / Math.max(1, window.innerHeight));
        heroImage.style.setProperty("--hero-y", `${heroProgress * 34}px`);
        heroImage.style.setProperty("--hero-scale", `${1.07 + heroProgress * .035}`);
      }

      const cinematic = document.querySelector(".cinematic");
      const cinematicImage = document.querySelector(".cinematic-inner > img");
      if (cinematic && cinematicImage) {
        const rect = cinematic.getBoundingClientRect();
        const total = Math.max(1, cinematic.offsetHeight - window.innerHeight);
        const localProgress = Math.min(1, Math.max(0, -rect.top / total));
        cinematicImage.style.setProperty("--cinematic-y", `${(localProgress - .5) * 42}px`);
        cinematicImage.style.setProperty("--cinematic-scale", `${1.32 - localProgress * .18}`);
      }

      const offer = document.querySelector(".offer");
      const offerImage = document.querySelector(".offer-image img");
      if (offer && offerImage) {
        const rect = offer.getBoundingClientRect();
        const local = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
        offerImage.style.setProperty("--offer-y", `${(local - .5) * 32}px`);
      }

      const poster = document.querySelector(".poster-card img");
      if (poster) {
        const rect = poster.getBoundingClientRect();
        const local = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
        poster.style.setProperty("--poster-y", `${(local - .5) * 22}px`);
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

  const splitWords = (element) => {
    if (!element || element.dataset.wordsReady === "true") return;
    element.dataset.wordsReady = "true";
    element.setAttribute("aria-label", element.textContent.trim().replace(/\s+/g, " "));

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });

    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    let index = 0;
    textNodes.forEach((textNode) => {
      const fragment = document.createDocumentFragment();
      const pieces = textNode.nodeValue.split(/(\s+)/);

      pieces.forEach((piece) => {
        if (!piece) return;
        if (/^\s+$/.test(piece)) {
          fragment.appendChild(document.createTextNode(piece));
          return;
        }

        const mask = document.createElement("span");
        mask.className = "word-mask";
        mask.setAttribute("aria-hidden", "true");

        const inner = document.createElement("span");
        inner.className = "word-inner";
        inner.style.setProperty("--word-index", index++);
        inner.textContent = piece;

        mask.appendChild(inner);
        fragment.appendChild(mask);
      });

      textNode.replaceWith(fragment);
    });
  };

  document.querySelectorAll(
    ".hero h1, .intro h2, .cinematic-copy h2, .section-heading h2, .offer-copy h2, .promise h2, .faq-title h2"
  ).forEach(splitWords);

  const revealItems = document.querySelectorAll(".reveal");
  revealItems.forEach((item, index) => {
    if (!item.style.getPropertyValue("--reveal-delay")) {
      item.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
    }
  });

  document.querySelectorAll(".spec-list > div").forEach((item, index) => {
    item.style.setProperty("--item-index", index);
  });
  document.querySelectorAll(".offer-copy li").forEach((item, index) => {
    item.style.setProperty("--item-index", index);
  });
  document.querySelectorAll(".footer-links a").forEach((item, index) => {
    item.style.setProperty("--item-index", index % 4);
  });

  const observed = new Set([
    ...revealItems,
    ...document.querySelectorAll(".spec-list, .offer-copy, footer, .section, .offer"),
  ]);

  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible", "in-view");
          if (!entry.target.classList.contains("section") && !entry.target.classList.contains("offer")) {
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: .12, rootMargin: "0px 0px -7% 0px" }
    );
    observed.forEach((item) => observer.observe(item));
  } else {
    observed.forEach((item) => item.classList.add("is-visible", "in-view"));
  }

  document.querySelectorAll(".faq-list details").forEach((details) => {
    const answer = details.querySelector("p");
    if (answer && !answer.closest(".faq-answer")) {
      const shell = document.createElement("div");
      shell.className = "faq-answer";
      const inner = document.createElement("div");
      answer.replaceWith(shell);
      inner.appendChild(answer);
      shell.appendChild(inner);
    }

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
      orbX += (pointerX - orbX) * .12;
      orbY += (pointerY - orbY) * .12;
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
      root.style.setProperty("--grid-x", `${50 + (event.clientX / window.innerWidth - .5) * 2}%`);
      root.style.setProperty("--grid-y", `${50 + (event.clientY / window.innerHeight - .5) * 2}%`);
    }, { passive: true });

    document.querySelectorAll(".bento > *").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.setProperty("--tilt-x", `${-y * 5.5}deg`);
        card.style.setProperty("--tilt-y", `${x * 7}deg`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
    });

    document.querySelectorAll(".header-buy, .buy-button, .text-link, .mobile-buy a").forEach((target) => {
      target.addEventListener("pointermove", (event) => {
        const rect = target.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        target.style.setProperty("--magnetic-x", `${x * .12}px`);
        target.style.setProperty("--magnetic-y", `${y * .16}px`);
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
});
