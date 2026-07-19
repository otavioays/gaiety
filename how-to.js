(function installHowToApplicationSection() {
  "use strict";

  if (document.querySelector("#como-usar")) return;

  if (!document.querySelector('link[data-how-to-style]')) {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "how-to.css?v=ritual-1";
    stylesheet.dataset.howToStyle = "";
    document.head.appendChild(stylesheet);
  }

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

      <div class="how-to-rail" aria-hidden="true">
        <span class="how-to-number">1</span>
        <span class="how-to-number">2</span>
        <span class="how-to-number">3</span>
      </div>

      <div class="how-to-grid">
        <article class="how-to-step" data-step="1">
          <figure>
            <div class="how-to-image">
              <img src="assets/how-to-step-1.svg" width="320" height="400" loading="lazy" decoding="async" alt="Pessoa retirando o patch da película protetora">
            </div>
            <figcaption><h3>Retire o patch da película protetora.</h3></figcaption>
          </figure>
        </article>

        <article class="how-to-step" data-step="2">
          <figure>
            <div class="how-to-image">
              <img src="assets/how-to-step-2.svg" width="320" height="400" loading="lazy" decoding="async" alt="Pessoa aplicando o patch sobre a parte superior do braço">
            </div>
            <figcaption><h3>Aplique sobre a pele limpa e seca do braço.</h3></figcaption>
          </figure>
        </article>

        <article class="how-to-step" data-step="3">
          <figure>
            <div class="how-to-image">
              <img src="assets/how-to-step-3.svg" width="320" height="400" loading="lazy" decoding="async" alt="Pessoa pressionando o patch para fixá-lo na pele">
            </div>
            <figcaption><h3>Pressione toda a superfície até ficar bem fixado.</h3></figcaption>
          </figure>
        </article>
      </div>

      <p class="how-to-note">Prefira uma área sem pelos e não aplique sobre pele irritada. Siga o tempo de uso indicado na embalagem.</p>
    </div>
  `;

  const target = document.querySelector("#problema") || document.querySelector("#mecanismo") || document.querySelector("#produto");
  const main = document.querySelector("main");

  if (target && target.parentNode) {
    target.parentNode.insertBefore(section, target);
  } else if (main) {
    main.appendChild(section);
  }
})();
