(function installFinalOffer(){
  "use strict";

  const STYLE_MARKER = "data-final-offer-style";

  function loadStyle(){
    if(document.querySelector(`link[${STYLE_MARKER}]`)) return;
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.href="final-offer.css?v=offer-1";
    link.setAttribute(STYLE_MARKER,"");
    document.head.appendChild(link);
  }

  function productVisual(twoUnits){
    return `
      <div class="offer-card__visual" aria-hidden="true">
        <div class="offer-card__products">
          ${twoUnits ? '<img class="offer-card__product offer-card__product--back" src="assets/mushroom-complex-patch.png" width="346" height="402" loading="lazy" decoding="async" alt="">' : ""}
          <img class="offer-card__product" src="assets/mushroom-complex-patch.png" width="346" height="402" loading="lazy" decoding="async" alt="">
          <span class="offer-card__patch-sheet"><i></i><i></i><i></i><i></i></span>
          <span class="offer-card__single-patch"></span>
        </div>
      </div>`;
  }

  function offerCard({units,price,compare,featured}){
    return `
      <article class="offer-card${featured ? " offer-card--featured" : ""}" data-offer-card="${units}">
        ${featured ? '<div class="offer-card__ribbon">★ Mais vantajoso ★</div>' : ""}
        <h3 class="offer-card__title">${units} ${units===1 ? "Unidade" : "Unidades"}</h3>
        ${productVisual(units===2)}
        <div class="offer-card__benefits">
          <span><i>✓</i>Suporte imunológico</span>
          <span><i>✓</i>Função cerebral</span>
          <span><i>✓</i>Foco &amp; clareza</span>
        </div>
        <div class="offer-card__price-row">
          ${compare ? `<span class="offer-card__compare">${compare}</span>` : ""}
          <strong class="offer-card__price"><small>R$</small>${price}</strong>
        </div>
        <button class="offer-card__button" type="button" data-offer-button="${units}"><span>🛒</span> Comprar agora</button>
        <div class="offer-card__meta"><span>🚚 Envio rápido</span><span>🛡️ Garantia de satisfação</span></div>
      </article>`;
  }

  function mount(){
    const faq=document.querySelector("#duvidas");
    const testimonials=document.querySelector("#depoimentos");
    if(!faq || !testimonials) return false;

    const oldList=document.querySelector("#lista");
    if(oldList && !oldList.classList.contains("final-offer")) oldList.remove();
    document.querySelector(".final-offer")?.remove();

    const section=document.createElement("section");
    section.className="final-offer";
    section.id="lista";
    section.dataset.section="final-offer";
    section.setAttribute("aria-labelledby","final-offer-title");
    section.innerHTML=`
      <div class="container final-offer__inner">
        <header class="final-offer__heading">
          <div class="final-offer__badge">Oferta <span>especial</span></div>
          <h2 id="final-offer-title">Escolha <em>seu kit</em></h2>
          <p>Garanta seu Mushroom Complex com o melhor custo-benefício.</p>
        </header>
        <div class="final-offer__grid">
          ${offerCard({units:2,price:"150",compare:"R$166",featured:true})}
          ${offerCard({units:1,price:"83",compare:"",featured:false})}
        </div>
        <div class="final-offer__trust">
          <article><i>🌿</i><div><strong>100% Natural</strong><p>Ingredientes de origem natural e segura.</p></div></article>
          <article><i>🧠</i><div><strong>Desempenho Mental</strong><p>Apoia memória, foco e clareza mental.</p></div></article>
          <article><i>✚</i><div><strong>Bem-estar Diário</strong><p>Fortalece sua rotina e o bem-estar geral.</p></div></article>
        </div>
      </div>`;

    testimonials.insertAdjacentElement("afterend",section);
    section.insertAdjacentElement("afterend",faq);

    section.querySelectorAll("[data-offer-button]").forEach(button=>{
      button.addEventListener("click",()=>{
        const units=Number(button.dataset.offerButton||0);
        if(window.ConversionTracker?.track){
          Promise.resolve(window.ConversionTracker.track("offer_click",{
            offer_units:units,
            offer_price:units===2 ? 150 : 83,
            placement:"final_offer"
          })).catch(()=>null);
        }
      });
    });

    return true;
  }

  function initialize(){
    loadStyle();
    if(mount()) return;
    const observer=new MutationObserver(()=>{
      if(mount()) observer.disconnect();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    window.setTimeout(()=>observer.disconnect(),12000);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",initialize,{once:true});
  else initialize();
})();