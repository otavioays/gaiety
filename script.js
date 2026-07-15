document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  document.querySelectorAll("[data-gaiety-hero]").forEach((image) => {
    image.src = "data:image/webp;base64," + [window.GAIETY_HERO_PART1, window.GAIETY_HERO_PART2, window.GAIETY_HERO_PART3].filter(Boolean).join("");
  });

  const revealElements = document.querySelectorAll(".reveal");

  revealElements.forEach((element) => {
    const delay = element.dataset.delay;
    if (delay) element.style.setProperty("--delay", `${delay}ms`);
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, revealObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  // Replace this URL once and every purchase button will follow it.
  const checkoutUrl = "https://seu-checkout.com";
  document.querySelectorAll(".checkout-link").forEach((link) => {
    link.href = checkoutUrl;
  });

  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
});
