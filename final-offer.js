(function installFinalOffer(){
  "use strict";

  const STYLE_MARKER = "data-final-offer-style";
  const META_PIXEL_ID = "1725992278652713";
  const PRODUCT_ID = "15917657129329";
  const VARIANT_IDS = {
    1: "64223935332721",
    2: "64223935299953"
  };
  const CHECKOUT_URLS = {
    1: `https://tedyzw-27.myshopify.com/cart/${VARIANT_IDS[1]}:1?checkout`,
    2: `https://tedyzw-27.myshopify.com/cart/${VARIANT_IDS[2]}:1?checkout`
  };
  const VIEW_CONTENT_KEY = "gaiety_meta_view_content_v3";
  const OFFER_IMPRESSION_KEY = "gaiety_offer_impressions_v1";

  function loadStyle(){
    if(document.querySelector(`link[${STYLE_MARKER}]`)) return;
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.href="final-offer.css?v=offer-1";
    link.setAttribute(STYLE_MARKER,"");
    document.head.appendChild(link);
  }

  function loadFaqModule(){
    if(document.querySelector("script[data-objection-faq-module]")) return;
    const script=document.createElement("script");
    script.src=`faq-objections.js?v=objections-1-${Date.now()}`;
    script.async=false;
    script.dataset.objectionFaqModule="";
    document.head.appendChild(script);
  }

  function loadBrandLogoModule(){
    if(document.querySelector("script[data-brand-logo-module]")) return;
    const script=document.createElement("script");
    script.src=`brand-logo.js?v=brand-logo-1-${Date.now()}`;
    script.async=false;
    script.dataset.brandLogoModule="";
    document.head.appendChild(script);
  }

  function trackerEvent(name,properties,options){
    const bridge=window.GaietyTracking;
    if(bridge && typeof bridge.track==="function"){
      return Promise.resolve(bridge.track(name,properties||{},options||{})).catch(()=>false);
    }
    if(window.ConversionTracker && typeof window.ConversionTracker.track==="function"){
      return Promise.resolve(window.ConversionTracker.track(name,properties||{},options||{})).catch(()=>false);
    }
    return Promise.resolve(false);
  }

  function buildTrackedCheckoutUrl(baseUrl,properties){
    const bridge=window.GaietyTracking;
    if(bridge && typeof bridge.buildCheckoutUrl==="function"){
      return bridge.buildCheckoutUrl(baseUrl,properties||{});
    }
    return baseUrl;
  }

  function metaPixelReady(){
    return typeof window.fbq==="function";
  }

  function createEventId(eventName){
    const random=window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return `gaiety-${eventName.toLowerCase()}-${random}`;
  }

  function trackMetaEvent(eventName,customData,options={}){
    const eventId=createEventId(eventName);

    if(metaPixelReady()){
      try{
        window.fbq("trackSingle",META_PIXEL_ID,eventName,customData,{eventID:eventId});
      }catch(_error){}
    }

    if(options.trackerEventName){
      void trackerEvent(
        options.trackerEventName,
        {
          ...customData,
          ...(options.trackerProperties||{}),
          meta_event_id:eventId,
          meta_event_name:eventName,
          meta_pixel_id:META_PIXEL_ID,
          browser_event_requested:true,
          server_event_requested:false
        },
        options.preferBeacon ? {beacon:true} : {}
      );
    }

    return eventId;
  }

  function installViewContentTracking(section){
    let alreadySent=false;
    try{alreadySent=window.sessionStorage.getItem(VIEW_CONTENT_KEY)==="1";}
    catch(_error){}
    if(alreadySent) return;

    let sent=false;
    const send=()=>{
      if(sent) return;
      sent=true;
      try{window.sessionStorage.setItem(VIEW_CONTENT_KEY,"1");}
      catch(_error){}
      trackMetaEvent("ViewContent",{
        currency:"BRL",
        value:84,
        content_ids:[PRODUCT_ID],
        content_type:"product",
        content_name:"Mushroom Complex",
        content_category:"Foco e bem-estar"
      },{
        trackerEventName:"product_view",
        trackerProperties:{
          product_id:PRODUCT_ID,
          minimum_price:84,
          maximum_price:156,
          offer_count:2,
          placement:"sales_page"
        }
      });
    };

    window.setTimeout(send,800);

    if(!("IntersectionObserver" in window)) return;

    const observer=new IntersectionObserver(entries=>{
      const visible=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>=0.25);
      if(!visible) return;
      observer.disconnect();
      send();
    },{threshold:[0.25]});
    observer.observe(section);
  }

  function readOfferImpressions(){
    try{return JSON.parse(window.sessionStorage.getItem(OFFER_IMPRESSION_KEY)||"{}");}
    catch(_error){return {};}
  }

  function writeOfferImpressions(value){
    try{window.sessionStorage.setItem(OFFER_IMPRESSION_KEY,JSON.stringify(value));}
    catch(_error){}
  }

  function installOfferImpressions(section){
    const sent=readOfferImpressions();
    const buttons=Array.from(section.querySelectorAll("[data-offer-button]"));

    const send=(button)=>{
      const units=Number(button.dataset.offerButton||0);
      if(!units || sent[units]) return;
      sent[units]=new Date().toISOString();
      writeOfferImpressions(sent);
      void trackerEvent("cta_impression",{
        placement:"final_offer",
        cta_goal:"checkout",
        product_id:PRODUCT_ID,
        variant_id:VARIANT_IDS[units],
        offer_units:units,
        offer_price:units===2 ? 156 : 84,
        element_text:"Comprar agora"
      });
    };

    if(!("IntersectionObserver" in window)){
      buttons.forEach(send);
      return;
    }

    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting||entry.intersectionRatio<0.5) return;
        send(entry.target);
        observer.unobserve(entry.target);
      });
    },{threshold:[0.5]});

    buttons.forEach(button=>observer.observe(button));
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

  function offerCard({units,installment,compare,featured}){
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
          <strong class="offer-card__price"><small>12x de R$</small>${installment}</strong>
        </div>
        <button class="offer-card__button" type="button" data-offer-button="${units}" data-checkout-url="${CHECKOUT_URLS[units]}"><span>🛒</span> Comprar agora</button>
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
    section.dataset.trackSection="final_offer";
    section.setAttribute("aria-labelledby","final-offer-title");
    section.innerHTML=`
      <div class="container final-offer__inner">
        <header class="final-offer__heading">
          <div class="final-offer__badge">Oferta <span>especial</span></div>
          <h2 id="final-offer-title">Escolha <em>seu kit</em></h2>
          <p>Garanta seu Mushroom Complex com o melhor custo-benefício.</p>
        </header>
        <div class="final-offer__grid">
          ${offerCard({units:2,installment:"13",compare:"R$166",featured:true})}
          ${offerCard({units:1,installment:"7",compare:"",featured:false})}
        </div>
        <div class="final-offer__trust">
          <article><i>🌿</i><div><strong>100% Natural</strong><p>Ingredientes de origem natural e segura.</p></div></article>
          <article><i>🧠</i><div><strong>Desempenho Mental</strong><p>Apoia memória, foco e clareza mental.</p></div></article>
          <article><i>✚</i><div><strong>Bem-estar Diário</strong><p>Fortalece sua rotina e o bem-estar geral.</p></div></article>
        </div>
      </div>`;

    testimonials.insertAdjacentElement("afterend",section);
    section.insertAdjacentElement("afterend",faq);
    installViewContentTracking(section);
    installOfferImpressions(section);

    section.querySelectorAll("[data-offer-button]").forEach(button=>{
      button.addEventListener("click",()=>{
        const units=Number(button.dataset.offerButton||0);
        const price=units===2 ? 156 : 84;
        const variantId=VARIANT_IDS[units];
        const baseCheckoutUrl=button.dataset.checkoutUrl;
        const checkoutId=createEventId("checkout");
        const checkoutProperties={
          product_id:PRODUCT_ID,
          variant_id:variantId,
          offer_units:units,
          quantity:units,
          value:price,
          cart_value:price,
          currency:"BRL",
          placement:"final_offer",
          checkout_provider:"shopify",
          checkout_id:checkoutId,
          ct_checkout_id:checkoutId,
          destination_host:"tedyzw-27.myshopify.com"
        };

        void trackerEvent("buy_button_click",checkoutProperties,{beacon:true});

        trackMetaEvent("InitiateCheckout",{
          currency:"BRL",
          value:price,
          content_ids:[variantId],
          content_type:"product",
          content_name:`Mushroom Complex - ${units} ${units===1 ? "unidade" : "unidades"}`,
          content_category:"Foco e bem-estar",
          num_items:units
        },{
          preferBeacon:true,
          trackerEventName:"checkout_redirect",
          trackerProperties:checkoutProperties
        });

        const checkoutUrl=buildTrackedCheckoutUrl(baseCheckoutUrl,checkoutProperties);
        if(checkoutUrl){
          window.setTimeout(()=>window.location.assign(checkoutUrl),80);
        }
      });
    });

    return true;
  }

  function initialize(){
    loadStyle();
    loadFaqModule();
    loadBrandLogoModule();
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
