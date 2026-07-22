(function installOfferValueAnchor(){
  "use strict";

  const MARKER="data-offer-value-anchor";
  const STYLE_MARKER="data-offer-value-anchor-style";
  const TRACKING_KEY="gaiety_offer_value_anchor_impression_v1";

  function installStyles(){
    if(document.querySelector(`style[${STYLE_MARKER}]`)) return;

    const style=document.createElement("style");
    style.setAttribute(STYLE_MARKER,"");
    style.textContent=`
      .offer-value-anchor{position:relative;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(280px,.9fr);gap:26px;align-items:center;margin:0 auto 42px;padding:30px;border:1px solid rgba(54,0,68,.12);border-radius:26px;background:linear-gradient(135deg,#fff 0%,#fdecf2 56%,#f8f6cb 100%);box-shadow:0 24px 60px rgba(54,0,68,.1);overflow:hidden}
      .offer-value-anchor::before{position:absolute;right:-70px;top:-90px;width:240px;height:240px;border-radius:50%;content:"";background:radial-gradient(circle,#ff4e9c 0 9%,rgba(255,78,156,.18) 10% 42%,transparent 43%);opacity:.75;pointer-events:none}
      .offer-value-anchor__copy{position:relative;z-index:1}
      .offer-value-anchor__eyebrow{display:inline-flex;margin:0 0 12px;padding:7px 11px;border-radius:999px;color:#fff;background:#360044;font-size:.72rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
      .offer-value-anchor h3{max-width:690px;margin:0;color:#360044;font-size:clamp(1.7rem,3vw,2.65rem);font-weight:900;line-height:1.03;letter-spacing:-.055em}
      .offer-value-anchor h3 strong{color:#d81775}
      .offer-value-anchor__shock{margin:14px 0 0;color:#360044;font-size:1.08rem;font-weight:800;line-height:1.45}
      .offer-value-anchor__shock b{color:#d81775;font-size:1.2em}
      .offer-value-anchor__list{display:grid;gap:11px;margin:22px 0 0;padding:0;list-style:none}
      .offer-value-anchor__list li{display:flex;align-items:flex-start;gap:10px;color:#43224b;font-size:.98rem;font-weight:700;line-height:1.4}
      .offer-value-anchor__list i{display:grid;width:24px;height:24px;flex:0 0 auto;place-items:center;border-radius:50%;color:#360044;background:#e7f148;font-style:normal;font-size:.82rem;font-weight:900}
      .offer-value-anchor__price{position:relative;z-index:1;display:grid;place-items:center;min-height:260px;padding:26px;border-radius:22px;color:#fff;background:#360044;text-align:center;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08),0 20px 45px rgba(54,0,68,.18)}
      .offer-value-anchor__price span{font-size:.78rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;opacity:.78}
      .offer-value-anchor__price del{display:block;margin-top:7px;color:#ffafd3;font-size:1.15rem;font-weight:800;text-decoration-thickness:2px}
      .offer-value-anchor__price strong{display:block;margin-top:7px;color:#e7f148;font-size:clamp(2.25rem,5vw,4rem);font-weight:950;line-height:.95;letter-spacing:-.07em}
      .offer-value-anchor__price small{display:block;max-width:220px;margin-top:12px;font-size:.82rem;font-weight:700;line-height:1.45;opacity:.82}
      .offer-value-anchor__note{grid-column:1/-1;margin:-4px 0 0;color:#705a75;font-size:.72rem;line-height:1.45;text-align:center}
      @media(max-width:780px){.offer-value-anchor{grid-template-columns:1fr;padding:22px;margin-bottom:32px;border-radius:22px}.offer-value-anchor__price{min-height:auto;padding:24px}.offer-value-anchor__note{text-align:left}.offer-value-anchor h3{font-size:2rem}}
      @media(max-width:480px){.offer-value-anchor{padding:18px;margin-left:-4px;margin-right:-4px}.offer-value-anchor h3{font-size:1.75rem}.offer-value-anchor__shock{font-size:1rem}.offer-value-anchor__list li{font-size:.92rem}}
    `;
    document.head.appendChild(style);
  }

  function trackImpression(anchor){
    let sent=false;
    try{sent=window.sessionStorage.getItem(TRACKING_KEY)==="1";}catch(_error){}
    if(sent) return;

    const send=()=>{
      try{window.sessionStorage.setItem(TRACKING_KEY,"1");}catch(_error){}
      const properties={
        placement:"final_offer",
        element_type:"value_anchor",
        comparison_value:983.27,
        currency:"BRL",
        product_name:"Mushroom Complex",
        comparison_basis:"average_separate_mushroom_packages"
      };
      if(window.GaietyTracking?.track) void window.GaietyTracking.track("value_anchor_impression",properties).catch(()=>false);
      else if(window.ConversionTracker?.track) void window.ConversionTracker.track("value_anchor_impression",properties).catch(()=>false);
    };

    if(!("IntersectionObserver" in window)){send();return;}
    const observer=new IntersectionObserver(entries=>{
      if(!entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>=.4)) return;
      observer.disconnect();
      send();
    },{threshold:[.4]});
    observer.observe(anchor);
  }

  function mount(){
    const section=document.querySelector(".final-offer");
    const heading=section?.querySelector(".final-offer__heading");
    const grid=section?.querySelector(".final-offer__grid");
    if(!section||!heading||!grid) return false;
    if(section.querySelector(`[${MARKER}]`)) return true;

    const anchor=document.createElement("section");
    anchor.className="offer-value-anchor";
    anchor.setAttribute(MARKER,"");
    anchor.setAttribute("aria-label","Comparação de valor dos sete cogumelos");
    anchor.innerHTML=`
      <div class="offer-value-anchor__copy">
        <span class="offer-value-anchor__eyebrow">Faça as contas</span>
        <h3>Comprar os 7 cogumelos separadamente custaria, em média, <strong>R$ 983,27</strong>.</h3>
        <p class="offer-value-anchor__shock">Isso é quase <b>R$ 1.000</b> espalhados em sete embalagens diferentes.</p>
        <ul class="offer-value-anchor__list">
          <li><i>✓</i><span>Reunir os 7 cogumelos em uma única fórmula.</span></li>
          <li><i>✓</i><span>Evitar sete compras, sete potes e sete decisões por dia.</span></li>
          <li><i>✓</i><span>Transformar tudo em um ritual simples de 3 minutos.</span></li>
        </ul>
      </div>
      <div class="offer-value-anchor__price">
        <span>Em vez de montar tudo separado</span>
        <del>R$ 983,27 em média</del>
        <strong>12x de R$ 7</strong>
        <small>Comece com uma unidade do Gaiety Modo Claro e escolha seu kit abaixo.</small>
      </div>
      <p class="offer-value-anchor__note">Comparação baseada na média de uma embalagem de cada cogumelo vendido separadamente. Quantidades, concentrações e duração podem variar entre produtos.</p>
    `;

    grid.insertAdjacentElement("beforebegin",anchor);
    trackImpression(anchor);
    return true;
  }

  function initialize(){
    installStyles();
    if(mount()) return;
    const observer=new MutationObserver(()=>{
      if(mount()) observer.disconnect();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    window.setTimeout(()=>observer.disconnect(),15000);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",initialize,{once:true});
  else initialize();
})();
