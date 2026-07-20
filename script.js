(function installRitualNítidoExperience() {
  "use strict";

  const documentRoot = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion) documentRoot.classList.add("motion-enabled");

  function trackerEvent(name, properties) {
    const tracker = window.ConversionTracker;
    if (!tracker || typeof tracker.track !== "function") return Promise.resolve(null);

    try {
      return Promise.resolve(tracker.track(name, properties || {})).catch(() => null);
    } catch (_error) {
      return Promise.resolve(null);
    }
  }

  function installHowToSection() {
    if (document.querySelector("#como-usar") || document.querySelector("script[data-how-to-module]")) return;

    const script = document.createElement("script");
    script.src = `how-to.js?v=ritual-8-${Date.now()}`;
    script.async = false;
    script.dataset.howToModule = "";
    document.head.appendChild(script);
  }

  function installFinalOfferModule() {
    if (document.querySelector("script[data-final-offer-module]")) return;

    const script = document.createElement("script");
    script.src = `final-offer.js?v=offer-1-${Date.now()}`;
    script.async = false;
    script.dataset.finalOfferModule = "";
    document.head.appendChild(script);
  }

  function installHeader() {
    const header = document.querySelector("[data-header]");
    if (!header) return;

    const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  function installMenu() {
    const button = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-menu]");
    if (!button || !menu) return;

    const setOpen = (open) => {
      button.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      const label = button.querySelector(".sr-only");
      if (label) label.textContent = open ? "Fechar menu" : "Abrir menu";
    };

    button.addEventListener("click", () => {
      setOpen(button.getAttribute("aria-expanded") !== "true");
    });

    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));

    document.addEventListener("click", (event) => {
      if (button.contains(event.target) || menu.contains(event.target)) return;
      setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      button.focus();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 960) setOpen(false);
    });
  }

  function installReveal() {
    const elements = Array.from(document.querySelectorAll(".reveal"));
    if (!documentRoot.classList.contains("motion-enabled") || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    elements.forEach((element) => observer.observe(element));
  }

  function installHeroReviews() {
    const root = document.querySelector("[data-hero-reviews]");
    if (!root) return;

    const reviews = Array.from(root.querySelectorAll("[data-hero-review]"));
    const dots = Array.from(root.querySelectorAll("[data-hero-review-dot]"));
    if (!reviews.length || reviews.length !== dots.length) return;

    let currentIndex = 0;

    const showReview = (nextIndex, trackChange) => {
      currentIndex = (nextIndex + reviews.length) % reviews.length;

      reviews.forEach((review, index) => {
        const active = index === currentIndex;
        review.hidden = !active;
        review.classList.toggle("is-active", active);
      });

      dots.forEach((dot, index) => {
        const active = index === currentIndex;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", String(active));
        dot.tabIndex = active ? 0 : -1;
      });

      if (trackChange) {
        trackerEvent("hero_review_change", {
          review_index: currentIndex + 1,
          page_version: "ritual-nitido-prelaunch-v1",
        });
      }
    };

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        showReview(index, true);
      });
    });

    showReview(0, false);
  }

  function installFaq() {
    const details = Array.from(document.querySelectorAll(".faq-list details"));
    details.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;
        details.forEach((other) => {
          if (other !== item) other.open = false;
        });
        trackerEvent("faq_open", {
          question: (item.querySelector("summary")?.textContent || "").replace("+", "").trim().slice(0, 160),
          page_version: "ritual-nitido-prelaunch-v1",
        });
      });
    });
  }

  function installStickyDocks() {
    const docks = Array.from(document.querySelectorAll("[data-mobile-dock], [data-desktop-dock]"));
    const hero = document.querySelector(".hero");
    const waitlist = document.querySelector("#lista");
    if (!docks.length || !hero) return;

    const updateDock = () => {
      const passedHero = window.scrollY > Math.max(380, hero.offsetHeight * 0.58);
      const atForm = waitlist && waitlist.getBoundingClientRect().top < window.innerHeight * 0.42;
      docks.forEach((dock) => dock.classList.toggle("is-visible", passedHero && !atForm));
    };

    updateDock();
    window.addEventListener("scroll", updateDock, { passive: true });
    window.addEventListener("resize", updateDock);
  }

  function installWaitlistForm() {
    const form = document.querySelector("[data-waitlist-form]");
    const status = form?.querySelector("[data-form-status]");
    if (!form || !status) return;

    const setStatus = (message, state) => {
      status.textContent = message;
      status.dataset.state = state;
      status.classList.add("is-visible");
    };

    const markInvalidFields = () => {
      form.querySelectorAll("input").forEach((field) => {
        field.setAttribute("aria-invalid", String(!field.checkValidity()));
      });
    };

    form.querySelectorAll("input").forEach((field) => {
      field.addEventListener("input", () => {
        field.removeAttribute("aria-invalid");
        status.classList.remove("is-visible");
      });
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      markInvalidFields();

      if (!form.checkValidity()) {
        setStatus("Revise os campos marcados antes de continuar.", "error");
        trackerEvent("waitlist_validation_error", { page_version: "ritual-nitido-prelaunch-v1" });
        return;
      }

      const endpoint = (form.dataset.endpoint || "").trim();
      if (!endpoint) {
        setStatus("Prévia concluída: o fluxo está pronto, mas nenhum dado foi enviado. Conecte o endpoint oficial antes da publicação.", "preview");
        trackerEvent("waitlist_preview_submit", {
          placement: "waitlist_form",
          page_version: "ritual-nitido-prelaunch-v1",
          pii_sent_to_tracker: false,
        });
        return;
      }

      const button = form.querySelector("button[type='submit']");
      const originalLabel = button?.innerHTML;
      if (button) {
        button.disabled = true;
        button.innerHTML = "<span>Enviando…</span>";
      }

      try {
        const payload = Object.fromEntries(new FormData(form).entries());
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("waitlist_request_failed");

        form.reset();
        form.querySelectorAll("input").forEach((field) => field.removeAttribute("aria-invalid"));
        setStatus("Cadastro confirmado. Você receberá as próximas atualizações da validação.", "success");
        trackerEvent("waitlist_submit", {
          placement: "waitlist_form",
          page_version: "ritual-nitido-prelaunch-v1",
          pii_sent_to_tracker: false,
        });

        if (typeof window.fbq === "function") window.fbq("track", "Lead");
      } catch (_error) {
        setStatus("Não foi possível concluir agora. Tente novamente em alguns instantes.", "error");
        trackerEvent("waitlist_submit_error", { page_version: "ritual-nitido-prelaunch-v1" });
      } finally {
        if (button) {
          button.disabled = false;
          button.innerHTML = originalLabel;
        }
      }
    });
  }

  function installSectionTracking() {
    if (!("IntersectionObserver" in window)) return;

    const seen = new Set();
    const sections = document.querySelectorAll("[data-section]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.25) return;
          const name = entry.target.dataset.section;
          if (!name || seen.has(name)) return;
          seen.add(name);
          trackerEvent("section_view", {
            section: name,
            page_version: "ritual-nitido-prelaunch-v1",
          });
          observer.unobserve(entry.target);
        });
      },
      { threshold: [0.25] },
    );

    sections.forEach((section) => observer.observe(section));
  }

  function initialize() {
    const year = document.querySelector("#year");
    if (year) year.textContent = String(new Date().getFullYear());

    installHowToSection();
    installFinalOfferModule();
    installHeader();
    installMenu();
    installReveal();
    installHeroReviews();
    installFaq();
    installStickyDocks();
    installWaitlistForm();
    installSectionTracking();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();