(function installRitualSections() {
  "use strict";

  function loadStylesheet(href, datasetKey) {
    if (document.querySelector(`link[${datasetKey}]`)) return;
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = href;
    stylesheet.setAttribute(datasetKey, "");
    document.head.appendChild(stylesheet);
  }

  loadStylesheet("ingredient-grid.css?v=ritual-1", "data-ingredient-grid-style");
  loadStylesheet("how-to.css?v=ritual-1", "data-how-to-style");
  loadStylesheet("trim-after-how-to.css?v=ritual-1", "data-trim-after-how-to-style");

  if (!document.querySelector("#ingredientes-em-destaque")) {
    const blendSection = document.createElement("section");
    blendSection.className = "blend-showcase";
    blendSection.id = "ingredientes-em-destaque";
    blendSection.dataset.section = "ingredient-comparison";
    blendSection.setAttribute("aria-labelledby", "ingredientes-titulo");
    blendSection.innerHTML = `
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
            <div class="blend-card__body">
              <div class="blend-card__icon"><span aria-hidden="true">🦁</span><small>Clareza mental</small></div>
              <strong class="blend-card__vs">VS</strong>
              <div class="blend-card__obstacle"><span aria-hidden="true">🗂️</span><small>Abas abertas</small></div>
            </div>
            <footer class="blend-card__foot">ESTUDADO EM ATENÇÃO, MEMÓRIA E VELOCIDADE MENTAL</footer>
          </article>

          <article class="blend-card">
            <header class="blend-card__head"><h3>Cordyceps</h3><span class="blend-card__badge" aria-hidden="true">⚡</span></header>
            <div class="blend-card__body">
              <div class="blend-card__icon"><span aria-hidden="true">⚡</span><small>Sustentação</small></div>
              <strong class="blend-card__vs">VS</strong>
              <div class="blend-card__obstacle"><span aria-hidden="true">🪫</span><small>Energia no fim</small></div>
            </div>
            <footer class="blend-card__foot">PESQUISADO EM ENERGIA, RESISTÊNCIA E DESEMPENHO</footer>
          </article>

          <article class="blend-card">
            <header class="blend-card__head"><h3>Reishi</h3><span class="blend-card__badge" aria-hidden="true">🌙</span></header>
            <div class="blend-card__body">
              <div class="blend-card__icon"><span aria-hidden="true">🌙</span><small>Equilíbrio</small></div>
              <strong class="blend-card__vs">VS</strong>
              <div class="blend-card__obstacle"><span aria-hidden="true">🌫️</span><small>Fadiga mental</small></div>
            </div>
            <footer class="blend-card__foot">INVESTIGADO EM FADIGA, BEM-ESTAR E RECUPERAÇÃO</footer>
          </article>

          <article class="blend-card">
            <header class="blend-card__head"><h3>Chaga</h3><span class="blend-card__badge" aria-hidden="true">🛡️</span></header>
            <div class="blend-card__body">
              <div class="blend-card__icon"><span aria-hidden="true">🛡️</span><small>Proteção</small></div>
              <strong class="blend-card__vs">VS</strong>
              <div class="blend-card__obstacle"><span aria-hidden="true">💥</span><small>Desgaste diário</small></div>
            </div>
            <footer class="blend-card__foot">FONTE DE COMPOSTOS ANTIOXIDANTES INVESTIGADOS</footer>
          </article>

          <article class="blend-card">
            <header class="blend-card__head"><h3>Maitake</h3><span class="blend-card__badge" aria-hidden="true">✨</span></header>
            <div class="blend-card__body">
              <div class="blend-card__icon"><span aria-hidden="true">✨</span><small>Continuidade</small></div>
              <strong class="blend-card__vs">VS</strong>
              <div class="blend-card__obstacle"><span aria-hidden="true">↗️↙️</span><small>Ritmo irregular</small></div>
            </div>
            <footer class="blend-card__foot">PESQUISADO EM SUPORTE COGNITIVO E ENVELHECIMENTO</footer>
          </article>

          <article class="blend-card">
            <header class="blend-card__head"><h3>Shiitake</h3><span class="blend-card__badge" aria-hidden="true">🌿</span></header>
            <div class="blend-card__body">
              <div class="blend-card__icon"><span aria-hidden="true">🌿</span><small>Vitalidade</small></div>
              <strong class="blend-card__vs">VS</strong>
              <div class="blend-card__obstacle"><span aria-hidden="true">🥀</span><small>Rotina sem base</small></div>
            </div>
            <footer class="blend-card__foot">INGREDIENTE FUNCIONAL LIGADO A VITALIDADE E DEFESA</footer>
          </article>
        </div>

        <p class="blend-showcase__note">Os estudos citados na linha do tempo avaliaram ingredientes e preparações específicas. A seção apresenta o papel estratégico de cada ingrediente dentro da proposta do blend.</p>
      </div>
    `;

    const timeline = document.querySelector(".attention-evidence");
    const problem = document.querySelector("#problema");
    const main = document.querySelector("main");

    if (timeline && timeline.parentNode) {
      timeline.insertAdjacentElement("afterend", blendSection);
    } else if (problem && problem.parentNode) {
      problem.parentNode.insertBefore(blendSection, problem);
    } else if (main) {
      main.appendChild(blendSection);
    }
  }

  if (!document.querySelector("#como-usar")) {
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
  }
})();
