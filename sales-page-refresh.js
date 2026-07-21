(function refreshGaietySalesPage() {
  "use strict";

  const setText = (selector, text) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = text;
  };

  const setHTML = (selector, html) => {
    const element = document.querySelector(selector);
    if (element) element.innerHTML = html;
  };

  const setMany = (selector, values) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (values[index] !== undefined) element.innerHTML = values[index];
    });
  };

  document.title = "Ritual Nítido™ | Foco, energia e clareza para começar";
  document.querySelector('meta[name="description"]')?.setAttribute("content", "Conheça o Ritual Nítido™, um ritual visível de cinco passos criado para reduzir a fricção do começo e devolver clareza à sua rotina.");

  setMany(".announcement-track span", ["Primeiro lote", "Cadastro gratuito"]);
  setMany(".announcement-track strong", ["Acesso prioritário ao Ritual Nítido™", "Seja uma das primeiras a conhecer"]);

  setHTML(".hero-offer-strip", "<span>✦ ACESSO PRIORITÁRIO:</span> PRIMEIRO LOTE");
  setText(".hero-callout", "PARE DE SE CONTENTAR");
  setText(".hero h1", "Com foco quebrado, energia no limite e a sensação de nunca terminar o que começou");
  setHTML(".hero-lead", "Descubra o <strong>Ritual Nítido™</strong>: um ritual visível de cinco passos criado para reduzir a fricção do começo, devolver clareza à próxima ação e ajudar você a entrar no ritmo em menos de 2 minutos.");
  setHTML(".hero-primary-button", "<span>Quero começar meu ritual</span><b>↗</b>");
  setMany(".hero-assurances span", ["<i>✓</i> Ritual simples para a rotina real", "<i>✓</i> Resultados individuais variam"]);
  setText(".hero-review-note", "Relatos publicados por clientes. Avatares ilustrativos. Resultados individuais variam.");
  setHTML(".hero-opinion-badge", "<strong>Ritual</strong><span>de 2 minutos</span>");

  const truthItems = document.querySelectorAll(".truth-grid p");
  if (truthItems[0]) truthItems[0].innerHTML = '<span class="truth-icon truth-icon--known">✓</span><strong>Ritual visível:</strong> 8 patches para transformar intenção em um sinal concreto';
  if (truthItems[1]) truthItems[1].innerHTML = '<span class="truth-icon truth-icon--claimed">✦</span><strong>Complexo de cogumelos:</strong> uma mistura criada para acompanhar sua rotina';
  if (truthItems[2]) truthItems[2].innerHTML = '<span class="truth-icon truth-icon--unknown">→</span><strong>Feito para o agora:</strong> foco, energia e clareza em um gesto simples';

  setHTML(".legacy-origin-heading h2", "Como Nossos Ancestrais <em>PROSPERAVAM</em> Antes de o Foco Virar Mais Uma Tela");
  setMany(".legacy-origin-copy p", [
    "Cogumelos atravessaram milhares de anos como alimento, recurso natural e parte de práticas tradicionais voltadas ao equilíbrio e à vitalidade.",
    "Hoje, ingredientes como Juba-de-leão, Cordyceps, Reishi, Maitake e Shiitake voltaram ao centro das conversas sobre energia, cognição e bem-estar.",
    "O Ritual Nítido™ recupera essa lógica ancestral e a traduz para a rotina moderna: menos decisões, um sinal visível e uma próxima ação clara."
  ]);
  setMany(".legacy-industry-copy p", [
    "<strong>O problema não é falta de vontade. É viver cercada por estímulos que disputam sua atenção antes mesmo de você começar.</strong>",
    "Mais cafeína, mais aplicativos e mais listas podem até criar movimento, mas raramente resolvem o instante em que você precisa sair da inércia.",
    "Por isso, criamos um ritual que cabe no mundo real: visível, simples e fácil de repetir até o começo deixar de depender de motivação."
  ]);
  setHTML(".legacy-belief-copy h3", "Na GAIETY, acreditamos que os <strong>COGUMELOS</strong> podem ser a <em>PONTE</em> entre a sabedoria ancestral e o <em>FOCO</em> que a rotina moderna fragmentou.");
  setMany(".legacy-belief-copy p", [
    "O Ritual Nítido™ combina um complexo de cogumelos com um sistema comportamental de cinco passos para tirar o começo da sua cabeça e colocá-lo diante dos seus olhos.",
    "Pesquisas humanas com ingredientes como Juba-de-leão, Cordyceps, Reishi e Maitake oferecem uma base promissora para investigar foco, energia, fadiga e suporte cognitivo.",
    "Em vez de esperar a vontade aparecer, você cria um sinal, escolhe uma ação e entra no ritmo."
  ]);
  setHTML(".legacy-unlock-button", "Quero começar meu ritual <span>↗</span>");
  setMany(".legacy-trust-row span", ["● Ritual simples e repetível", "● Acesso prioritário"]);
  setHTML(".legacy-testing-title", '<span aria-hidden="true">⚗</span><strong>Quer conhecer a ciência por trás dos ingredientes?</strong>');
  setHTML(".legacy-testing-banner > a", 'Ver pesquisas <span>↗</span>');
  setHTML(".legacy-research-notes > p", "<strong>Nota importante:</strong> os estudos apresentados avaliam ingredientes e preparações específicas. Eles ajudam a explicar o potencial dos componentes, mas resultados individuais variam.");

  setText(".attention-kicker", "PESQUISAS HUMANAS COM OS INGREDIENTES");
  setHTML(".attention-evidence-heading h2", "O Que Os Estudos Sugerem Sobre <em>FOCO, ENERGIA E CLAREZA?</em>");
  setHTML(".attention-evidence-heading p", "Velocidade mental, disposição e menor fadiga formam uma base poderosa para entrar no ritmo, e alguns dos ingredientes mais conhecidos da mistura já apresentaram <strong>resultados humanos promissores nessas frentes.</strong>");
  setHTML(".attention-evidence-cta", 'Quero destravar meu foco <span>↗</span>');
  setText(".attention-evidence-footer > p", "Os estudos citados avaliaram ingredientes e preparações específicas. Eles ajudam a contextualizar o potencial da fórmula, e resultados individuais variam.");

  setText(".problem .eyebrow", "O problema que outra lista não resolve");
  setHTML(".problem h2", "Você sabe o que precisa fazer.<br><em>O difícil é atravessar o primeiro minuto.</em>");
  setText(".problem .section-heading > p", "Notificação, nova aba, mais uma decisão. Quando tudo pede atenção ao mesmo tempo, até começar uma tarefa pequena parece pesado.");
  setHTML(".argument-card h3", "Talvez você não precise querer mais. Talvez precise <em>decidir menos</em> na hora de começar.");
  setText(".argument-card > p:not(.eyebrow)", "O Ritual Nítido™ reduz o campo: fecha o que compete, escolhe uma ação e cria um começo visível.");

  setHTML(".mechanism-intro h2", "Um sinal visível.<br>Uma próxima ação.");
  setHTML(".mechanism-intro > p", "O <strong>Sistema Ritual Visível™</strong> transforma o patch em uma âncora para o comportamento: um lembrete físico de que você não precisa resolver o dia inteiro, apenas iniciar a próxima ação.");
  setHTML(".mechanism-boundary p", "<strong>O diferencial:</strong> em vez de depender de motivação, você repete o mesmo caminho até o começo ficar mais leve, familiar e automático.");

  setText(".product-copy .eyebrow", "O ritual que cabe na rotina real");
  setText(".product-copy h2", "Um pequeno sinal pode mudar a forma como o seu dia começa.");
  setText(".product-copy .lead", "O Mushroom Complex entra como a âncora visível de um ritual desenhado para reduzir decisões e colocar você em movimento.");
  const facts = document.querySelectorAll(".fact-stack > div");
  if (facts[0]) facts[0].innerHTML = "<span>Na embalagem</span><strong>11 Mushroom Blend · 5000 mcg · 8 patches</strong>";
  if (facts[1]) facts[1].innerHTML = "<span>No ritual</span><strong>Um sinal físico para marcar o início do seu bloco de foco</strong>";
  if (facts[2]) facts[2].innerHTML = "<span>Na prática</span><strong>Menos negociação mental e uma próxima ação mais clara</strong>";
  setHTML(".product-copy .text-link", 'Conhecer a ciência dos ingredientes <span>→</span>');
  setText(".dose-top > span", "Complexo em destaque");
  setText(".dose-card > p", "A embalagem reúne o complexo em um formato simples de incorporar ao ritual diário, sem cápsulas, misturas ou mais uma tarefa para lembrar.");
  setText(".dose-stamp", "8 PATCHES\nPOR EMBALAGEM");
  setMany(".source-card figcaption > *", ["Produto do ritual", "Mushroom Complex", "Formato prático e visível"]);
  setText(".ingredient-heading .eyebrow", "Cogumelos presentes na proposta do complexo");
  setText(".ingredient-heading p", "Uma combinação de ingredientes tradicionalmente associados a energia, vitalidade e suporte cognitivo.");
  const missing = document.querySelector(".ingredient-missing");
  if (missing) missing.innerHTML = "Blend complementar <small>composição completa conforme embalagem</small>";

  setText(".proof .eyebrow", "Por que o ritual é diferente");
  setText(".proof h2", "Cinco peças que trabalham juntas");
  setText(".proof-heading > p", "O valor não está em mais uma promessa isolada, mas em um sistema simples que conecta sinal, ambiente e ação.");
  const proofCards = document.querySelectorAll(".proof-card");
  const proofCopy = [
    ["Sinal visível", "O patch marca fisicamente o momento de sair da intenção e entrar na ação."],
    ["Menos decisões", "O ritual reduz as escolhas do começo para que sua energia vá para a tarefa."],
    ["Uma ação clara", "Você escolhe um próximo movimento pequeno, específico e impossível de confundir."],
    ["Bloco protegido", "Notificações e abas concorrentes saem do caminho antes do primeiro passo."],
    ["Repetição simples", "O mesmo percurso é repetido até o começo exigir menos negociação mental."],
    ["Progresso visível", "Cada bloco concluído encerra o ciclo e prepara a próxima ação."]
  ];
  proofCards.forEach((card, index) => {
    const small = card.querySelector("small");
    const title = card.querySelector("h3");
    const body = card.querySelector("p");
    if (small) small.textContent = "Parte do sistema";
    if (title) title.textContent = proofCopy[index]?.[0] || title.textContent;
    if (body) body.textContent = proofCopy[index]?.[1] || body.textContent;
  });
  setHTML(".proof-rule > div", "<strong>A regra é simples:</strong><p>Não tente vencer o dia inteiro. Torne a próxima ação óbvia.</p>");

  setText(".founder-copy .eyebrow", "A história por trás do ritual");
  setText(".founder-copy h2", "Eu não precisava de mais informação. Precisava de um jeito confiável de começar.");
  setMany(".founder-copy > p", [
    "Durante muito tempo, eu tratei foco como uma sensação que deveria aparecer antes do trabalho. Quando ela não vinha, eu mudava de ferramenta, método ou estímulo.",
    "A virada aconteceu quando parei de tentar controlar o dia inteiro e construí um sinal para a primeira ação. O Ritual Nítido™ nasceu dessa ideia: tornar o começo visível, curto e repetível."
  ]);
  setText(".founder-copy blockquote", "“Você não precisa sentir foco para começar. Precisa de um caminho curto o bastante para começar mesmo sem ele.”");

  setText(".qualification .eyebrow", "Para quem este ritual faz sentido");
  setHTML(".qualification h2", "Você não precisa mudar sua personalidade.<br><em>Precisa mudar o primeiro minuto.</em>");
  const fitTitles = document.querySelectorAll(".fit-card > span");
  if (fitTitles[0]) fitTitles[0].textContent = "É para você se…";
  if (fitTitles[1]) fitTitles[1].textContent = "Use com consciência se…";
  const yesItems = document.querySelectorAll(".fit-card--yes li");
  ["você demora mais para começar do que para executar;", "sua energia se perde em pequenas decisões;", "quer um ritual curto, físico e fácil de repetir;", "gosta de transformar intenção em uma ação concreta."].forEach((text, index) => { if (yesItems[index]) yesItems[index].textContent = text; });
  const noItems = document.querySelectorAll(".fit-card--no li");
  ["você possui sensibilidade cutânea ou alergia a adesivos;", "está gestante, amamentando ou usa medicamentos;", "procura substituir sono, alimentação ou orientação profissional;", "espera que qualquer produto faça o trabalho sem uma mudança de comportamento."].forEach((text, index) => { if (noItems[index]) noItems[index].textContent = text; });

  setText(".waitlist-copy .eyebrow", "Primeiro lote · acesso por ordem de cadastro");
  setText(".waitlist-copy h2", "Dê ao seu cérebro um sinal claro de que chegou a hora de começar.");
  setText(".waitlist-copy > p", "Cadastre-se para receber acesso prioritário ao Ritual Nítido™ e às condições do primeiro lote.");
  const benefitTitles = document.querySelectorAll(".waitlist-benefits strong");
  const benefitBodies = document.querySelectorAll(".waitlist-benefits p");
  ["Ritual guiado", "Acesso prioritário", "Decisão sem pressão"].forEach((text, index) => { if (benefitTitles[index]) benefitTitles[index].textContent = text; });
  ["Os cinco passos para transformar o patch em um sinal de início.", "Você recebe as informações do primeiro lote antes da abertura geral.", "Conheça a proposta, os detalhes e decida no seu tempo."].forEach((text, index) => {
    if (!benefitBodies[index]) return;
    const strong = benefitBodies[index].querySelector("strong");
    benefitBodies[index].childNodes.forEach((node) => { if (node.nodeType === Node.TEXT_NODE) node.remove(); });
    benefitBodies[index].append(document.createTextNode(text));
    if (strong) benefitBodies[index].prepend(strong);
  });
  setHTML(".guarantee-box p", "<strong>Compromisso GAIETY</strong>Você recebe as informações do produto e das condições do primeiro lote antes de tomar qualquer decisão.");
  setText(".form-topline span", "Seu acesso prioritário");
  setText(".form-topline b", "GRATUITO");
  setText(".waitlist-form-card h3", "Quero receber o acesso");
  setText(".waitlist-form-card > p", "Leva menos de um minuto e coloca você entre as primeiras pessoas a conhecer o Ritual Nítido™.");
  setText(".consent-check span", "Quero receber novidades sobre o Ritual Nítido™ e posso cancelar quando quiser.");
  setHTML(".form-submit", "<span>Quero acesso ao primeiro lote</span><b>→</b>");
  setText(".form-privacy", "🔒 Seus dados ficam protegidos e não serão vendidos.");
  setHTML(".scarcity-note p", "<strong>Primeiro lote:</strong> o acesso será liberado por ordem de cadastro quando as unidades estiverem disponíveis.");

  setText(".faq-heading .eyebrow", "Perguntas antes de começar");
  setText(".faq-heading h2", "Tudo o que você precisa saber sobre o Ritual Nítido™.");
  setText(".faq-heading > p", "Respostas diretas para você decidir com segurança.");
  setHTML(".faq-heading .text-link", 'Receber acesso prioritário <span>→</span>');
  const faq = document.querySelectorAll(".faq-list details");
  const faqCopy = [
    ["O que é o Ritual Nítido™?", "É um sistema de cinco passos que usa o patch como sinal visível para reduzir decisões, escolher uma próxima ação e facilitar o começo de um bloco de foco."],
    ["Quais cogumelos aparecem no complexo?", "A proposta reúne ingredientes como Juba-de-leão, Cordyceps, Chaga, Reishi, Turkey Tail, Maitake e Shiitake em um blend de cogumelos."],
    ["O que significam os 5000 mcg?", "É a quantidade destacada na embalagem do complexo. As informações completas de uso acompanham o produto."],
    ["Como o patch entra no ritual?", "Ele funciona como uma âncora visual e tátil: ao vê-lo ou senti-lo, você executa os cinco passos e inicia a próxima ação."],
    ["Quanto tempo o ritual leva?", "A preparação foi desenhada para levar menos de dois minutos. O objetivo é tornar o começo leve, não criar outra tarefa complicada."],
    ["Posso usar todos os dias?", "Siga sempre as instruções do produto. Pessoas com sensibilidade cutânea, condições de saúde, gestantes, lactantes ou quem usa medicamentos devem buscar orientação profissional."],
    ["Quando receberei acesso?", "Os cadastrados recebem as informações e as condições do primeiro lote por ordem de inscrição."],
    ["O cadastro já gera uma compra?", "Não. O cadastro apenas garante prioridade para conhecer a oferta quando o primeiro lote for liberado."]
  ];
  faq.forEach((item, index) => {
    const summary = item.querySelector("summary");
    const paragraph = item.querySelector("p");
    if (summary && faqCopy[index]) summary.innerHTML = `${faqCopy[index][0]}<span>+</span>`;
    if (paragraph && faqCopy[index]) paragraph.textContent = faqCopy[index][1];
  });

  setText(".closing .eyebrow", "A próxima ação pode ser pequena");
  setHTML(".closing h2", "Você não precisa esperar o foco.<br><em>Pode criar o começo.</em>");
  setText(".closing p", "Entre na lista prioritária e conheça o Ritual Nítido™ assim que o primeiro lote for liberado.");
  setHTML(".closing .cta-button", '<span>Quero começar meu ritual</span><b>→</b>');
  setText(".closing small", "Cadastro gratuito · sem cartão · cancelamento a qualquer momento");

  setText(".footer-brand > p", "Menos pressão. Menos fricção. Uma próxima ação clara.");
  setText(".footer-bottom p:first-child", `© ${new Date().getFullYear()} GAIETY. Todos os direitos reservados.`);
  setText(".footer-bottom p:last-child", "Este conteúdo não substitui diagnóstico, tratamento ou orientação médica. Resultados individuais variam.");
  setText(".mobile-buy span", "Primeiro lote");
  setText(".mobile-buy strong", "Acesso prioritário");
  setText(".mobile-buy a", "Quero acesso →");
  setHTML(".dock-status p", "<strong>Primeiro lote</strong><small>Acesso prioritário por ordem de cadastro</small>");
  setText(".dock-progress span", "RITUAL EM 5 PASSOS");
  setText(".dock-progress small", "Menos fricção para começar");
  setHTML(".desktop-buy-dock > a", 'Quero começar <span>→</span>');
})();