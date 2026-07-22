(() => {
  "use strict";

  const body = document.querySelector(".article-body--longform");
  if (!body || body.dataset.inlineCtasInstalled === "true") return;

  const destinationBase = "https://gaiety.cloud/";
  const ctas = [
    {
      anchor: "Quase nunca os dois foram pensados para funcionar juntos, como um único ritual.",
      label: "Ver como funciona o ritual de foco",
      position: "early",
    },
    {
      anchor: "um gesto pequeno pode mudar o estado do corpo no qual sua mente tenta tanto trabalhar.",
      label: "Conhecer o sistema de 7 camadas",
      position: "middle",
    },
    {
      anchor: "Um patch. Sete cogumelos. Um único gesto para encurtar a distância entre abrir a tarefa e realmente começar.",
      label: "Quero encurtar a distância até começar",
      position: "late",
    },
  ];

  function buildDestination(position) {
    const url = new URL(destinationBase);
    url.searchParams.set("ct_entry", "funnel");
    url.searchParams.set("ct_funnel", "editorial");
    url.searchParams.set("ct_page_type", "funnel");
    url.searchParams.set("ct_funnel_id", "gaiety_modo_claro");
    url.searchParams.set("ct_funnel_page", "nitida_editorial");
    url.searchParams.set("ct_cta_position", position);
    return url.toString();
  }

  function createCta(config) {
    const link = document.createElement("a");
    link.className = "editorial-cta editorial-cta--inline";
    link.href = buildDestination(config.position);
    link.rel = "nofollow";
    link.dataset.funnelCta = "editorial";
    link.dataset.ctaPosition = config.position;
    link.dataset.editorialInlineCta = "true";
    link.innerHTML = `<span>${config.label}</span><strong aria-hidden="true">→</strong>`;
    return link;
  }

  const paragraphs = Array.from(body.querySelectorAll(":scope > p"));

  ctas.forEach((config) => {
    const anchorParagraph = paragraphs.find((paragraph) =>
      paragraph.textContent.trim().includes(config.anchor),
    );

    if (!anchorParagraph) return;
    anchorParagraph.insertAdjacentElement("afterend", createCta(config));
  });

  body.dataset.inlineCtasInstalled = "true";
})();
