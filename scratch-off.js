(function installGaietyScratchOffer(){
  "use strict";

  const STYLE_MARKER="data-gaiety-scratch-style";
  const MODAL_SELECTOR="[data-scratch-modal]";
  const META_PIXEL_ID="1725992278652713";
  const PRODUCT_ID="15917657129329";
  const VARIANT_ID="64223935299953";
  const OFFER_UNITS=2;
  const OFFER_PRICE=156;
  const COMPARE_PRICE=166;
  const REVEAL_THRESHOLD=0.48;

  let state={
    modal:null,
    trigger:null,
    checkoutUrl:"",
    checkoutId:"",
    checkoutProperties:null,
    context:null,
    scratching:false,
    scratchStarted:false,
    revealed:false,
    redirecting:false,
    lastCheck:0
  };

  function loadStyle(){
    if(document.querySelector(`link[${STYLE_MARKER}]`)) return;
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.href=`scratch-off.css?v=1-${Date.now()}`;
    link.setAttribute(STYLE_MARKER,"");
    document.head.appendChild(link);
  }

  function createEventId(name){
    const random=window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return `gaiety-${name.toLowerCase()}-${random}`;
  }

  function readCookie(name){
    const prefix=`${name}=`;
    const cookie=document.cookie
      .split(";")
      .map(part=>part.trim())
      .find(part=>part.startsWith(prefix));
    if(!cookie) return undefined;
    try{return decodeURIComponent(cookie.slice(prefix.length));}
    catch(_error){return cookie.slice(prefix.length);}
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

  function sendServerEvent(eventName,eventId,customData,{preferBeacon=false}={}){
    const payload={
      event_name:eventName,
      event_id:eventId,
      event_source_url:window.location.href,
      fbp:readCookie("_fbp"),
      fbc:readCookie("_fbc"),
      ...customData
    };
    const body=JSON.stringify(payload);

    if(preferBeacon && typeof navigator.sendBeacon==="function"){
      try{
        const queued=navigator.sendBeacon(
          "/api/meta-capi",
          new Blob([body],{type:"application/json"})
        );
        if(queued) return Promise.resolve(true);
      }catch(_error){}
    }

    return fetch("/api/meta-capi",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body,
      keepalive:true,
      credentials:"same-origin"
    }).then(response=>response.ok).catch(()=>false);
  }

  function trackScratchEvent(name,extra={}){
    const properties={
      product_id:PRODUCT_ID,
      variant_id:VARIANT_ID,
      offer_units:OFFER_UNITS,
      offer_price:OFFER_PRICE,
      compare_price:COMPARE_PRICE,
      currency:"BRL",
      placement:"final_offer",
      scratch_reward:"R$10 de desconto",
      checkout_id:state.checkoutId,
      ct_checkout_id:state.checkoutId,
      ...extra
    };
    void trackerEvent(name,properties,{beacon:name==="scratch_redeem"||name==="scratch_skip"});
  }

  function trackInitiateCheckout(){
    const eventId=createEventId("checkout");
    const customData={
      currency:"BRL",
      value:OFFER_PRICE,
      content_ids:[VARIANT_ID],
      content_type:"product",
      content_name:"Mushroom Complex - 2 unidades",
      content_category:"Foco e bem-estar",
      num_items:OFFER_UNITS
    };

    try{
      if(typeof window.fbq==="function"){
        if(!window.__gaietyMetaPixelInitialized){
          window.fbq("init",META_PIXEL_ID);
          window.__gaietyMetaPixelInitialized=true;
        }
        window.fbq("trackSingle",META_PIXEL_ID,"InitiateCheckout",customData,{eventID:eventId});
      }
    }catch(_error){}

    void sendServerEvent("InitiateCheckout",eventId,customData,{preferBeacon:true});
    void trackerEvent("checkout_redirect",{
      ...state.checkoutProperties,
      meta_event_id:eventId,
      meta_event_name:"InitiateCheckout",
      meta_pixel_id:META_PIXEL_ID,
      browser_event_requested:true,
      server_event_requested:true,
      scratch_completed:state.revealed
    },{beacon:true});
  }

  function modalMarkup(){
    return `
      <div class="scratch-modal" data-scratch-modal hidden>
        <section class="scratch-dialog" role="dialog" aria-modal="true" aria-labelledby="scratch-title" aria-describedby="scratch-description">
          <button class="scratch-dialog__close" type="button" data-scratch-close aria-label="Fechar raspadinha">×</button>

          <div class="scratch-dialog__content">
            <div class="scratch-dialog__copy">
              <div class="scratch-brand" aria-label="GAIETY Modo Claro">
                <strong>GAIETY</strong><span>MODO CLARO</span>
              </div>

              <span class="scratch-kicker">KIT DE 2 UNIDADES</span>
              <h2 id="scratch-title">Raspe para revelar seu presente</h2>
              <p id="scratch-description">Sua escolha desbloqueou um benefício exclusivo antes do checkout.</p>

              <div class="scratch-ticket-wrap">
                <div class="scratch-ticket" data-scratch-ticket>
                  <div class="scratch-reward" aria-live="polite">
                    <span>VOCÊ GANHOU</span>
                    <strong>R$ 10 OFF</strong>
                    <small>Kit por R$156 em vez de R$166</small>
                  </div>
                  <canvas class="scratch-canvas" data-scratch-canvas tabindex="0" role="button" aria-label="Raspe com o mouse ou dedo. Pressione Enter para revelar o benefício."></canvas>
                </div>
                <p class="scratch-instruction" data-scratch-instruction>Passe o dedo ou o mouse sobre o círculo.</p>
              </div>

              <button class="scratch-claim" type="button" data-scratch-claim disabled>
                Usar meu desconto e ir ao checkout <span>→</span>
              </button>
              <button class="scratch-skip" type="button" data-scratch-skip>Continuar sem raspar</button>
            </div>

            <div class="scratch-dialog__visual" aria-hidden="true">
              <div class="scratch-splash scratch-splash--one"></div>
              <div class="scratch-splash scratch-splash--two"></div>
              <div class="scratch-product-halo">
                <img src="assets/mushroom-complex-patch.png" alt="" width="346" height="402" decoding="async">
                <span class="scratch-product-badge"><b>2</b> unidades</span>
              </div>
              <div class="scratch-benefit-tag"><span>BENEFÍCIO</span><strong>DESBLOQUEADO</strong></div>
            </div>
          </div>
        </section>
      </div>`;
  }

  function ensureModal(){
    let modal=document.querySelector(MODAL_SELECTOR);
    if(modal) return modal;

    document.body.insertAdjacentHTML("beforeend",modalMarkup());
    modal=document.querySelector(MODAL_SELECTOR);

    modal.querySelector("[data-scratch-close]")?.addEventListener("click",()=>closeModal("close_button"));
    modal.querySelector("[data-scratch-skip]")?.addEventListener("click",()=>proceedToCheckout("skip"));
    modal.querySelector("[data-scratch-claim]")?.addEventListener("click",()=>proceedToCheckout("claim"));
    modal.addEventListener("click",event=>{
      if(event.target===modal) closeModal("backdrop");
    });
    modal.addEventListener("keydown",handleModalKeydown);

    return modal;
  }

  function handleModalKeydown(event){
    if(event.key==="Escape"){
      event.preventDefault();
      closeModal("escape");
      return;
    }

    if(event.key!=="Tab") return;
    const focusable=Array.from(state.modal.querySelectorAll('button:not([disabled]),canvas[tabindex="0"]'))
      .filter(element=>!element.hidden && element.offsetParent!==null);
    if(!focusable.length) return;

    const first=focusable[0];
    const last=focusable[focusable.length-1];
    if(event.shiftKey && document.activeElement===first){
      event.preventDefault();
      last.focus();
    }else if(!event.shiftKey && document.activeElement===last){
      event.preventDefault();
      first.focus();
    }
  }

  function drawCover(canvas,context){
    const width=canvas.width;
    const height=canvas.height;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    const gradient=context.createRadialGradient(width*.32,height*.25,0,width*.5,height*.5,width*.75);
    gradient.addColorStop(0,"#ff75b4");
    gradient.addColorStop(.55,"#e52c83");
    gradient.addColorStop(1,"#8a0b62");
    context.globalCompositeOperation="source-over";
    context.clearRect(0,0,width,height);
    context.fillStyle=gradient;
    context.fillRect(0,0,width,height);

    context.globalAlpha=.22;
    for(let index=0;index<95;index+=1){
      const radius=(2+Math.random()*7)*dpr;
      context.beginPath();
      context.arc(Math.random()*width,Math.random()*height,radius,0,Math.PI*2);
      context.fillStyle=index%3===0 ? "#edff45" : "#ffffff";
      context.fill();
    }
    context.globalAlpha=1;

    context.textAlign="center";
    context.textBaseline="middle";
    context.fillStyle="#ffffff";
    context.font=`900 ${31*dpr}px "DM Sans", sans-serif`;
    context.fillText("RASPE",width/2,height/2-15*dpr);
    context.font=`800 ${18*dpr}px "DM Sans", sans-serif`;
    context.fillText("AQUI",width/2,height/2+22*dpr);
  }

  function prepareCanvas(){
    const canvas=state.modal.querySelector("[data-scratch-canvas]");
    const rect=canvas.getBoundingClientRect();
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.max(1,Math.round(rect.width*dpr));
    canvas.height=Math.max(1,Math.round(rect.height*dpr));
    canvas.classList.remove("is-revealed");
    canvas.hidden=false;

    const context=canvas.getContext("2d",{willReadFrequently:true});
    state.context=context;
    drawCover(canvas,context);

    canvas.onpointerdown=event=>{
      if(state.revealed) return;
      state.scratching=true;
      canvas.setPointerCapture?.(event.pointerId);
      eraseAt(canvas,event);
      if(!state.scratchStarted){
        state.scratchStarted=true;
        trackScratchEvent("scratch_start",{input_type:event.pointerType||"unknown"});
      }
    };
    canvas.onpointermove=event=>{
      if(!state.scratching||state.revealed) return;
      eraseAt(canvas,event);
    };
    canvas.onpointerup=event=>{
      state.scratching=false;
      canvas.releasePointerCapture?.(event.pointerId);
      checkProgress(canvas,true);
    };
    canvas.onpointercancel=()=>{state.scratching=false;};
    canvas.onkeydown=event=>{
      if(event.key!=="Enter" && event.key!==" ") return;
      event.preventDefault();
      finishReveal("keyboard");
    };
  }

  function eraseAt(canvas,event){
    const rect=canvas.getBoundingClientRect();
    const scaleX=canvas.width/rect.width;
    const scaleY=canvas.height/rect.height;
    const x=(event.clientX-rect.left)*scaleX;
    const y=(event.clientY-rect.top)*scaleY;
    const brush=Math.max(30,Math.min(rect.width,rect.height)*.12)*scaleX;

    state.context.save();
    state.context.globalCompositeOperation="destination-out";
    state.context.beginPath();
    state.context.arc(x,y,brush,0,Math.PI*2);
    state.context.fill();
    state.context.restore();

    checkProgress(canvas,false);
  }

  function checkProgress(canvas,force){
    const now=performance.now();
    if(!force && now-state.lastCheck<110) return;
    state.lastCheck=now;

    const width=canvas.width;
    const height=canvas.height;
    const pixels=state.context.getImageData(0,0,width,height).data;
    const step=Math.max(8,Math.floor(Math.min(width,height)/38));
    const cx=width/2;
    const cy=height/2;
    const radius=Math.min(width,height)/2-step;
    let cleared=0;
    let sampled=0;

    for(let y=step;y<height;y+=step){
      for(let x=step;x<width;x+=step){
        const dx=x-cx;
        const dy=y-cy;
        if(dx*dx+dy*dy>radius*radius) continue;
        sampled+=1;
        const alpha=pixels[(y*width+x)*4+3];
        if(alpha<48) cleared+=1;
      }
    }

    if(sampled && cleared/sampled>=REVEAL_THRESHOLD){
      finishReveal("scratch");
    }
  }

  function finishReveal(method){
    if(state.revealed) return;
    state.revealed=true;
    state.scratching=false;

    const canvas=state.modal.querySelector("[data-scratch-canvas]");
    const claim=state.modal.querySelector("[data-scratch-claim]");
    const instruction=state.modal.querySelector("[data-scratch-instruction]");

    canvas.classList.add("is-revealed");
    canvas.setAttribute("aria-label","Benefício revelado: R$10 de desconto no kit de 2 unidades.");
    state.modal.classList.add("is-revealed");
    claim.disabled=false;
    if(instruction) instruction.textContent="Prêmio revelado. O desconto já está aplicado ao kit.";
    trackScratchEvent("scratch_reveal",{reveal_method:method});
    window.setTimeout(()=>claim.focus(),260);
  }

  function openModal(trigger){
    loadStyle();
    const modal=ensureModal();
    const checkoutId=createEventId("checkout");
    const checkoutProperties={
      product_id:PRODUCT_ID,
      variant_id:VARIANT_ID,
      offer_units:OFFER_UNITS,
      quantity:OFFER_UNITS,
      value:OFFER_PRICE,
      cart_value:OFFER_PRICE,
      currency:"BRL",
      placement:"final_offer",
      checkout_provider:"shopify",
      checkout_id:checkoutId,
      ct_checkout_id:checkoutId,
      destination_host:"gaiety-6507.myshopify.com",
      intermediate_step:"scratch_offer"
    };

    state={
      modal,
      trigger,
      checkoutUrl:trigger.dataset.checkoutUrl||"",
      checkoutId,
      checkoutProperties,
      context:null,
      scratching:false,
      scratchStarted:false,
      revealed:false,
      redirecting:false,
      lastCheck:0
    };

    modal.classList.remove("is-revealed");
    modal.querySelector("[data-scratch-claim]").disabled=true;
    modal.querySelector("[data-scratch-instruction]").textContent="Passe o dedo ou o mouse sobre o círculo.";
    modal.hidden=false;
    document.documentElement.classList.add("scratch-open");
    document.body.classList.add("scratch-open");

    void trackerEvent("buy_button_click",checkoutProperties,{beacon:true});
    trackScratchEvent("scratch_open");

    requestAnimationFrame(()=>{
      modal.classList.add("is-open");
      prepareCanvas();
      window.setTimeout(()=>modal.querySelector("[data-scratch-canvas]")?.focus(),120);
    });
  }

  function closeModal(reason){
    if(!state.modal || state.modal.hidden || state.redirecting) return;
    trackScratchEvent("scratch_close",{close_reason:reason,scratch_completed:state.revealed});
    const modal=state.modal;
    modal.classList.remove("is-open");
    document.documentElement.classList.remove("scratch-open");
    document.body.classList.remove("scratch-open");
    window.setTimeout(()=>{
      modal.hidden=true;
      state.trigger?.focus?.();
    },180);
  }

  function proceedToCheckout(action){
    if(state.redirecting) return;
    state.redirecting=true;

    const eventName=action==="claim" ? "scratch_redeem" : "scratch_skip";
    trackScratchEvent(eventName,{scratch_completed:state.revealed});
    trackInitiateCheckout();

    const button=state.modal.querySelector(action==="claim" ? "[data-scratch-claim]" : "[data-scratch-skip]");
    if(button){
      button.disabled=true;
      button.classList.add("is-loading");
    }

    const checkoutUrl=buildTrackedCheckoutUrl(state.checkoutUrl,state.checkoutProperties);
    if(checkoutUrl){
      window.setTimeout(()=>window.location.assign(checkoutUrl),150);
    }else{
      state.redirecting=false;
      if(button){
        button.disabled=false;
        button.classList.remove("is-loading");
      }
    }
  }

  function interceptTwoUnitCheckout(event){
    const trigger=event.target.closest?.('[data-offer-button="2"]');
    if(!trigger || trigger.disabled) return;
    event.preventDefault();
    event.stopPropagation();
    openModal(trigger);
  }

  loadStyle();
  document.addEventListener("click",interceptTwoUnitCheckout,true);
  window.GaietyScratchOffer={open:openModal,reveal:()=>finishReveal("manual")};
})();
