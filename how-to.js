(function installRitualSections() {
  "use strict";

  function loadStylesheet(path, marker) {
    if (document.querySelector(`link[${marker}]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `${path}?v=${Date.now()}`;
    link.setAttribute(marker, "");
    document.head.appendChild(link);
  }

  function installIngredientGrid() {
    if (document.querySelector("#ingredientes-em-destaque")) return;

    const section = document.createElement("section");
    section.className = "blend-showcase";
    section.id = "ingredientes-em-destaque";
    section.dataset.section = "ingredient-comparison";
    section.setAttribute("aria-labelledby", "ingredientes-titulo");
    section.innerHTML = `
      <div class="blend-showcase__product" aria-hidden="true">
        <img src="assets/mushroom-complex-patch.png" width="346" height="402" loading="lazy" decoding="async" alt="">
      </div>
      <div class="blend-showcase__jar" aria-hidden="true">
        <div class="blend-showcase__patches"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      </div>
      <div class="container blend-showcase__inner">
        <header class="blend-showcase__heading">
          <h2 id="ingredientes-titulo">Conheça 6 dos Cogumelos Funcionais Escolhidos Para Enfrentar <em>OS MAIORES</em> Ladrões do Seu Ritmo</h2>
          <p>Cada ingrediente ocupa uma frente diferente dentro do Ritual Nítido.</p>
        </header>
        <div class="blend-showcase__grid">
          <article class="blend-card">
            <header class="blend-card__head"><h3>Juba-de-leão</h3><span class="blend-card__badge" aria-hidden="true">🧠</span></header>
            <div class="blend-card__body"><div class="blend-card__icon"><span aria-hidden="true">🦁</span><small>Clareza mental</small></div><strong class="blend-card__vs">VS</strong><div class="blend-card__obstacle"><span aria-hidden="true">🗂️</span><small>Abas abertas</small></div></div>
            <footer class="blend-card__foot">ESTUDADO EM ATENÇÃO, MEMÓRIA E VELOCIDADE MENTAL</footer>
          </article>
          <article class="blend-card">
            <header class="blend-card__head"><h3>Cordyceps</h3><span class="blend-card__badge" aria-hidden="true">⚡</span></header>
            <div class="blend-card__body"><div class="blend-card__icon"><span aria-hidden="true">⚡</span><small>Sustentação</small></div><strong class="blend-card__vs">VS</strong><div class="blend-card__obstacle"><span aria-hidden="true">🪫</span><small>Energia no fim</small></div></div>
            <footer class="blend-card__foot">PESQUISADO EM ENERGIA, RESISTÊNCIA E DESEMPENHO</footer>
          </article>
          <article class="blend-card">
            <header class="blend-card__head"><h3>Reishi</h3><span class="blend-card__badge" aria-hidden="true">🌙</span></header>
            <div class="blend-card__body"><div class="blend-card__icon"><span aria-hidden="true">🌙</span><small>Equilíbrio</small></div><strong class="blend-card__vs">VS</strong><div class="blend-card__obstacle"><span aria-hidden="true">🌫️</span><small>Fadiga mental</small></div></div>
            <footer class="blend-card__foot">INVESTIGADO EM FADIGA, BEM-ESTAR E RECUPERAÇÃO</footer>
          </article>
          <article class="blend-card">
            <header class="blend-card__head"><h3>Chaga</h3><span class="blend-card__badge" aria-hidden="true">🛡️</span></header>
            <div class="blend-card__body"><div class="blend-card__icon"><span aria-hidden="true">🛡️</span><small>Proteção</small></div><strong class="blend-card__vs">VS</strong><div class="blend-card__obstacle"><span aria-hidden="true">💥</span><small>Desgaste diário</small></div></div>
            <footer class="blend-card__foot">FONTE DE COMPOSTOS ANTIOXIDANTES INVESTIGADOS</footer>
          </article>
          <article class="blend-card">
            <header class="blend-card__head"><h3>Maitake</h3><span class="blend-card__badge" aria-hidden="true">✨</span></header>
            <div class="blend-card__body"><div class="blend-card__icon"><span aria-hidden="true">✨</span><small>Continuidade</small></div><strong class="blend-card__vs">VS</strong><div class="blend-card__obstacle"><span aria-hidden="true">↗️↙️</span><small>Ritmo irregular</small></div></div>
            <footer class="blend-card__foot">PESQUISADO EM SUPORTE COGNITIVO E ENVELHECIMENTO</footer>
          </article>
          <article class="blend-card">
            <header class="blend-card__head"><h3>Shiitake</h3><span class="blend-card__badge" aria-hidden="true">🌿</span></header>
            <div class="blend-card__body"><div class="blend-card__icon"><span aria-hidden="true">🌿</span><small>Vitalidade</small></div><strong class="blend-card__vs">VS</strong><div class="blend-card__obstacle"><span aria-hidden="true">🥀</span><small>Rotina sem base</small></div></div>
            <footer class="blend-card__foot">INGREDIENTE FUNCIONAL LIGADO A VITALIDADE E DEFESA</footer>
          </article>
        </div>
        <p class="blend-showcase__note">Os estudos citados na linha do tempo avaliaram ingredientes e preparações específicas. A seção apresenta o papel estratégico de cada ingrediente dentro da proposta do blend.</p>
      </div>
    `;

    const timeline = document.querySelector(".attention-evidence");
    const fallback = document.querySelector("#problema");
    if (timeline) timeline.insertAdjacentElement("afterend", section);
    else if (fallback) fallback.insertAdjacentElement("beforebegin", section);
    else document.querySelector("main")?.appendChild(section);
  }

  function installHowTo() {
    if (document.querySelector("#como-usar")) return;

    const section = document.createElement("section");
    section.className = "how-to";
    section.id = "como-usar";
    section.dataset.section = "how-to";
    section.setAttribute("aria-labelledby", "como-usar-titulo");
    section.innerHTML = `
      <span class="how-to-splash" aria-hidden="true"></span>
      <div class="container">
        <header class="how-to-heading">
          <span class="eyebrow">Ritual em 3 passos</span>
          <h2 id="como-usar-titulo">Como usar o patch</h2>
          <p>Uma aplicação simples, rápida e sem complicação.</p>
        </header>
        <div class="how-to-rail" aria-hidden="true"><span class="how-to-number">1</span><span class="how-to-number">2</span><span class="how-to-number">3</span></div>
        <div class="how-to-grid">
          <article class="how-to-step" data-step="1"><figure><div class="how-to-image"><img src="assets/how-to-step-1.svg" width="320" height="400" loading="lazy" decoding="async" alt="Pessoa retirando o patch da película protetora"></div><figcaption><h3>Retire o patch da película protetora.</h3></figcaption></figure></article>
          <article class="how-to-step" data-step="2"><figure><div class="how-to-image"><img src="assets/how-to-step-2.svg" width="320" height="400" loading="lazy" decoding="async" alt="Pessoa aplicando o patch sobre a parte superior do braço"></div><figcaption><h3>Aplique sobre a pele limpa e seca do braço.</h3></figcaption></figure></article>
          <article class="how-to-step" data-step="3"><figure><div class="how-to-image"><img src="assets/how-to-step-3.svg" width="320" height="400" loading="lazy" decoding="async" alt="Pessoa pressionando o patch para fixá-lo na pele"></div><figcaption><h3>Pressione toda a superfície até ficar bem fixado.</h3></figcaption></figure></article>
        </div>
        <p class="how-to-note">Prefira uma área sem pelos e não aplique sobre pele irritada. Siga o tempo de uso indicado na embalagem.</p>
      </div>
    `;

    const target = document.querySelector("#problema") || document.querySelector("#mecanismo") || document.querySelector("#produto");
    if (target) target.insertAdjacentElement("beforebegin", section);
    else document.querySelector("main")?.appendChild(section);
  }

  function installTestimonials() {
    const faq = document.querySelector("#duvidas");
    if (!faq) return;

    document.querySelector("#depoimentos")?.remove();

    const images = [
      {
        src: "https://cdn.shopify.com/s/files/1/1027/4285/1953/files/gaiety-depoimento-1.png?v=1784546801",
        width: 517,
        height: 320,
      },
      {
        src: "https://cdn.shopify.com/s/files/1/1027/4285/1953/files/gaiety-depoimento-2.png?v=1784546812",
        width: 517,
        height: 151,
      },
      {
        src: "https://cdn.shopify.com/s/files/1/1027/4285/1953/files/gaiety-depoimento-3.png?v=1784546821",
        width: 516,
        height: 135,
      },
      {
        src: "https://cdn.shopify.com/s/files/1/1027/4285/1953/files/gaiety-depoimento-4.png?v=1784546832",
        width: 510,
        height: 139,
      },
    ];

    const section = document.createElement("section");
    section.className = "customer-voices";
    section.id = "depoimentos";
    section.dataset.section = "testimonials";
    section.setAttribute("aria-labelledby", "depoimentos-titulo");
    section.innerHTML = `
      <div class="container customer-voices__inner">
        <header class="customer-voices__heading">
          <h2 id="depoimentos-titulo">é isso que as pessoas estão dizendo:</h2>
        </header>
        <div class="customer-voices__images">
          ${images.map((image, index) => `
            <figure class="customer-voices__image-card">
              <img
                src="${image.src}"
                width="${image.width}"
                height="${image.height}"
                loading="${index === 0 ? "eager" : "lazy"}"
                decoding="async"
                alt="Captura de tela de depoimento de cliente"
              >
            </figure>
          `).join("")}
        </div>
      </div>
    `;

    faq.insertAdjacentElement("beforebegin", section);
  }

  function trimAfterHowTo() {
    const main = document.querySelector("main");
    const howTo = document.querySelector("#como-usar");
    const testimonials = document.querySelector("#depoimentos");
    const faq = document.querySelector("#duvidas");
    if (!main || !howTo || !testimonials || !faq) return;

    Array.from(main.children).forEach((element) => {
      const keep = element === howTo || element === testimonials || element === faq;
      const beforeHowTo = element.compareDocumentPosition(howTo) & Node.DOCUMENT_POSITION_FOLLOWING;
      if (!beforeHowTo && !keep) element.remove();
    });

    howTo.insertAdjacentElement("afterend", testimonials);
    testimonials.insertAdjacentElement("afterend", faq);

    document.querySelectorAll("[data-mobile-dock], [data-desktop-dock]").forEach((element) => element.remove());
    document.querySelectorAll('a[href="#problema"], a[href="#mecanismo"], a[href="#produto"], a[href="#provas"], a[href="#lista"], a[href="#qualificacao"]').forEach((element) => element.remove());
    faq.querySelector(".faq-heading .text-link")?.remove();
  }

  function installCornerPhotos() {
    document.querySelectorAll(".sales-corner-photo").forEach((element) => element.remove());
    const source = `assets/sales-corner-photo.svg?v=${Date.now()}`;
    const hero = document.querySelector(".hero");
    const faq = document.querySelector("#duvidas");

    function append(parent, position, loading) {
      if (!parent) return;
      const image = document.createElement("img");
      image.className = `sales-corner-photo sales-corner-photo--${position}`;
      image.src = source;
      image.alt = "";
      image.width = 520;
      image.height = 650;
      image.loading = loading;
      image.decoding = "async";
      image.setAttribute("aria-hidden", "true");
      parent.appendChild(image);
    }

    append(hero, "top-left", "eager");
    append(hero, "top-right", "eager");
    append(faq, "bottom-left", "lazy");
    append(faq, "bottom-right", "lazy");
  }

  function initialize() {
    loadStylesheet("ingredient-grid.css", "data-ingredient-grid-style");
    loadStylesheet("how-to.css", "data-how-to-style");
    loadStylesheet("sales-corners.css", "data-sales-corners-style");
    loadStylesheet("testimonials.css", "data-testimonials-style");

    installIngredientGrid();
    installHowTo();
    installTestimonials();
    trimAfterHowTo();
    installCornerPhotos();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();