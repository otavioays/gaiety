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
