document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const posterData = [
    window.GAIETY_VINTAGE_PART1,
    window.GAIETY_VINTAGE_PART2,
    window.GAIETY_VINTAGE_PART3,
    window.GAIETY_VINTAGE_PART4,
    window.GAIETY_VINTAGE_PART5
  ].filter(Boolean).join("");

  document.querySelectorAll("[data-gaiety-poster]").forEach((image) => {
    image.src = "data:image/webp;base64," + posterData;
  });

  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });

    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  const checkoutUrl = "https://seu-checkout.com";
  document.querySelectorAll(".checkout-link").forEach((link) => {
    link.href = checkoutUrl;
  });

  const faqItems = document.querySelectorAll(".faq details");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
});
