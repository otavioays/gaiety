(() => {
  "use strict";

  const IMAGES = {
    hero: {
      src: "https://cdn.shopify.com/s/files/1/1027/4285/1953/files/nitida-modo-claro-hero.webp?v=1784558683",
      alt: "Mesa dividida entre distração e foco, com o produto Modo Claro",
      width: 1024,
      height: 1536,
      caption: "Entre saber o que precisa ser feito e realmente começar existe um intervalo que pode consumir o dia inteiro."
    },
    gap: {
      src: "https://cdn.shopify.com/s/files/1/1027/4285/1953/files/nitida-lacuna-de-ativacao.webp?v=1784558725",
      alt: "Pessoa entre um ambiente escuro e um escritório iluminado",
      width: 1023,
      height: 1537,
      caption: "A proposta do Modo Claro é ocupar o intervalo entre decidir e realmente entrar na tarefa."
    },
    deadline: {
      src: "https://cdn.shopify.com/s/files/1/1027/4285/1953/files/nitida-prazo-e-procrastinacao.webp?v=1784558740",
      alt: "Mesa noturna com lista de tarefas, notificações e xícaras vazias",
      width: 1024,
      height: 1536,
      caption: "Quando o medo vira o único botão de início, o custo aparece no descanso, no estresse e na qualidade do trabalho."
    },
    ritual: {
      src: "https://cdn.shopify.com/s/files/1/1027/4285/1953/files/nitida-ritual-aplique-direcione-entre.webp?v=1784558697",
      alt: "Sequência visual do ritual Aplique, Direcione e Entre",
      width: 1023,
      height: 1537,
      caption: "O protocolo reduz o começo a três movimentos: aplique o sinal, direcione a atenção e entre na tarefa."
    },
    product: {
      src: "https://cdn.shopify.com/s/files/1/1027/4285/1953/files/nitida-modo-claro-produto.webp?v=1784558711",
      alt: "Embalagem, sachê e patch Modo Claro sobre uma mesa",
      width: 1023,
      height: 1537,
      caption: "O formato vestível foi pensado para permanecer visível durante o bloco escolhido."
    },
    apply: {
      src: "https://cdn.shopify.com/s/files/1/1027/4285/1953/files/nitida-aplicacao-patch.webp?v=1784558753",
      alt: "Pessoa aplicando o patch Modo Claro no braço",
      width: 1023,
      height: 1537,
      caption: "Ao permanecer no corpo, o patch funciona como lembrança concreta da decisão tomada para aquele período."
    },
    enter: {
      src: "https://cdn.shopify.com/s/files/1/1027/4285/1953/files/nitida-entrando-no-modo-claro.webp?v=1784558766",
      alt: "Pessoa saindo de um ambiente escuro e entrando em um escritório iluminado",
      width: 1122,
      height: 1402,
      caption: "A transição não promete criar outra pessoa. Ela procura tornar mais fácil entrar no estado em que você já sabe trabalhar."
    }
  };

  const H3_LINES = new Set([
    "Você já provou que consegue se concentrar",
    "Onde o Modo Claro entra"
  ]);

  const PULL_QUOTES = new Set([
    "“Em qual momento exatamente eu estou perdendo?”",
    "“Quando eu escolho começar, eu começo.”",
    "Aplique. Direcione. Entre.",
    "Você não precisa receber uma inteligência nova. Precisa acessar a capacidade que já possui quando ela mais importa.",
    "Um patch. Uma tarefa. Um bloco claro.",
    "Pare de esperar o foco aparecer. Entre no Modo Claro."
  ]);

  const IMAGE_AFTER = new Map([
    ["Foi essa pergunta que nos levou ao Gaiety Modo Claro, um patch vestível desenvolvido para transformar o começo do seu bloco mais importante em um ritual físico, visível e repetível.", ["gap", "inline-media--portrait"]],
    ["O pânico cobra juros. Ele aumenta seu estresse, destrói seu descanso e reduz a margem para produzir algo realmente bom. Pior: ensina sua mente que você só precisa agir quando a situação já se tornou dolorosa.", ["deadline", "inline-media--wide"]],
    ["Essa é a lógica comportamental do Ritual Modo Claro.", ["ritual", "inline-media--ritual"]],
    ["Você não está apenas escolhendo mais um produto para guardar na gaveta. Está escolhendo uma estrutura para usar antes de executar.", ["product", "inline-media--product"]],
    ["O patch se torna uma âncora física dentro do ritual. Ele transforma “preciso começar em algum momento” em “este é o momento em que eu começo”.", ["apply", "inline-media--portrait"]],
    ["Você não se transforma em outra pessoa. Acessa com mais frequência a versão de você que já apareceu sob pressão tantas vezes, mas agora sem precisar esperar o medo assumir o controle.", ["enter", "inline-media--final"]]
  ]);

  function escapeHtml(value) {
    return value.replace(/[&<>"]/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;"
    })[char]);
  }

  function figureHtml(key, extraClass = "") {
    const image = IMAGES[key];
    return `
      <figure class="inline-media ${extraClass}">
        <img src="${image.src}" alt="${image.alt}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async">
        <figcaption>${image.caption}</figcaption>
      </figure>`;
  }

  function ctaTarget() {
    return "https://gaiety.cloud/";
  }

  function buildArticle(lines) {
    const fragments = [];
    let verdictOpen = false;

    lines.forEach(line => {
      if (/^[1-7]\.\s/.test(line)) {
        const number = line.charAt(0);
        fragments.push(`<h2 id="razao-${number}">${escapeHtml(line)}</h2>`);
      } else if (H3_LINES.has(line)) {
        fragments.push(`<h3>${escapeHtml(line)}</h3>`);
      } else if (line === "Veredito editorial: vale a pena conhecer o Gaiety Modo Claro?") {
        verdictOpen = true;
        fragments.push('<section class="verdict-box"><p class="verdict-label">VEREDITO EDITORIAL</p><h2>Vale a pena conhecer o Gaiety Modo Claro?</h2>');
      } else if (line.startsWith("→ ")) {
        const label = line.slice(2);
        fragments.push(`<a class="editorial-cta" href="${ctaTarget()}" rel="nofollow"><span>${escapeHtml(label)}</span><strong>→</strong></a>`);
      } else if (PULL_QUOTES.has(line)) {
        fragments.push(`<p class="pull-quote">${escapeHtml(line)}</p>`);
      } else {
        fragments.push(`<p>${escapeHtml(line)}</p>`);
      }

      if (IMAGE_AFTER.has(line)) {
        const [key, extraClass] = IMAGE_AFTER.get(line);
        fragments.push(figureHtml(key, extraClass));
      }
    });

    if (verdictOpen) fragments.push("</section>");

    fragments.push(`
      <p class="commercial-note">Este material foi produzido pelo Nítida Studio em parceria comercial com a Gaiety. Os estudos citados não testaram o produto Modo Claro nem comprovam eficácia do formato em patch. Resultados individuais podem variar. O produto não substitui sono, alimentação, acompanhamento médico ou tratamento.</p>`);

    return fragments.join("\n");
  }

  function buildIndex() {
    return `
      <nav class="article-index" aria-label="As sete razões">
        <strong>Nesta análise</strong>
        <ol>
          <li><a href="#razao-1">A lacuna antes de começar</a></li>
          <li><a href="#razao-2">A identidade construída</a></li>
          <li><a href="#razao-3">Café, apps e motivação</a></li>
          <li><a href="#razao-4">O foco perto do prazo</a></li>
          <li><a href="#razao-5">O papel do ritual</a></li>
          <li><a href="#razao-6">Por que Lion’s Mane</a></li>
          <li><a href="#razao-7">O sinal vestível</a></li>
        </ol>
      </nav>`;
  }

  function updateSidebar(title) {
    const stories = document.querySelectorAll(".side-story p");
    if (stories[0]) stories[0].textContent = title;
    if (stories[1]) stories[1].textContent = "Por que tarefas importantes parecem mais difíceis antes do primeiro minuto";
    if (stories[2]) stories[2].textContent = "O que muda quando um hábito ganha um sinal físico e repetível";

    const relatedImage = document.querySelector(".related-story img");
    if (relatedImage) {
      relatedImage.src = IMAGES.product.src;
      relatedImage.alt = IMAGES.product.alt;
      relatedImage.width = IMAGES.product.width;
      relatedImage.height = IMAGES.product.height;
    }

    const relatedTitle = document.querySelector(".related-story p");
    if (relatedTitle) relatedTitle.textContent = "Modo Claro: o que existe por trás do protocolo Aplique, Direcione e Entre";
  }

  async function renderLongform() {
    const response = await fetch("article-copy.txt", { cache: "no-store" });
    if (!response.ok) throw new Error(`Não foi possível carregar a matéria (${response.status}).`);

    const raw = await response.text();
    const lines = raw.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const [title, deck, kicker, ...articleLines] = lines;

    document.title = `${title} | Nítida`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = deck;

    const headline = document.querySelector(".article-column > h1");
    const articleDeck = document.querySelector(".article-deck");
    const sponsored = document.querySelector(".sponsored-label");
    const hero = document.querySelector(".hero-media img");
    const heroCaption = document.querySelector(".hero-media figcaption");
    const body = document.querySelector(".article-body");
    const meta = document.querySelector(".article-meta");

    if (headline) headline.textContent = title;
    if (articleDeck) articleDeck.textContent = deck;

    if (sponsored) {
      let kickerNode = document.querySelector(".article-kicker");
      if (!kickerNode) {
        kickerNode = document.createElement("p");
        kickerNode.className = "article-kicker";
        sponsored.insertAdjacentElement("afterend", kickerNode);
      }
      kickerNode.textContent = kicker;
    }

    if (hero) {
      hero.src = IMAGES.hero.src;
      hero.alt = IMAGES.hero.alt;
      hero.width = IMAGES.hero.width;
      hero.height = IMAGES.hero.height;
      hero.fetchPriority = "high";
      hero.closest("figure")?.classList.add("hero-media--longform");
    }
    if (heroCaption) heroCaption.textContent = IMAGES.hero.caption;

    if (meta) {
      meta.innerHTML = `
        <p><strong>Por Nítida Studio</strong></p>
        <p>20 julho 2026, 13h40</p>
        <p>Atualizado há poucos minutos</p>
        <p class="reading-time">Tempo de leitura: 14 min</p>`;
    }

    if (body) {
      document.querySelector(".article-index")?.remove();
      body.insertAdjacentHTML("beforebegin", buildIndex());
      body.classList.add("article-body--longform");
      body.innerHTML = buildArticle(articleLines);
    }

    updateSidebar(title);
  }

  renderLongform().catch(error => {
    console.error(error);
    document.documentElement.classList.add("longform-load-error");
  });
})();
