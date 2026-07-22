(function installBrandExperience(){
  "use strict";

  const LOGO_URL="https://cdn.shopify.com/s/files/1/1027/4285/1953/files/gaiety-logo-original.png?v=1784562981";
  const SALE_END_AT=new Date("2026-07-22T23:59:59-03:00").getTime();

  function loadSalesPageRefresh(){
    if(!document.querySelector("link[data-sales-page-refresh]")){
      const link=document.createElement("link");
      link.rel="stylesheet";
      link.href=`sales-page-refresh.css?v=2-${Date.now()}`;
      link.dataset.salesPageRefresh="";
      document.head.appendChild(link);
    }

    if(!document.querySelector("script[data-sales-page-refresh]")){
      const script=document.createElement("script");
      script.src=`sales-page-refresh.js?v=2-${Date.now()}`;
      script.async=false;
      script.dataset.salesPageRefresh="";
      document.head.appendChild(script);
    }

    if(!document.querySelector("script[data-scratch-off-module]")){
      const script=document.createElement("script");
      script.src=`scratch-off.js?v=1-${Date.now()}`;
      script.async=false;
      script.dataset.scratchOffModule="";
      document.head.appendChild(script);
    }
  }

  function installStyles(){
    if(document.querySelector("style[data-brand-experience-style]")) return;

    const style=document.createElement("style");
    style.dataset.brandExperienceStyle="";
    style.textContent=`
      :root{--announcement-height:104px}
      .site-header{background:rgba(253,236,242,.96);border-bottom-color:rgba(54,0,68,.08)}
      .site-header.is-scrolled{background:rgba(253,236,242,.98);border-bottom-color:rgba(54,0,68,.14);box-shadow:0 8px 28px rgba(54,0,68,.08)}
      .brand.brand--image{display:inline-flex;width:80px;height:68px;align-items:center;justify-content:center;overflow:visible}
      .brand-logo-viewport{position:relative;display:block;width:80px;height:68px;overflow:hidden;border-radius:12px;flex:0 0 auto;background:#fdecf2}
      .brand-logo-viewport img{position:absolute;top:50%;left:50%;width:132px;max-width:none;height:auto;transform:translate(-50%,-50%);filter:drop-shadow(0 5px 10px rgba(54,0,68,.08))}
      .menu-toggle{background:#fdecf2}

      .announcement.announcement--sale{position:relative;display:block;min-height:104px;padding:10px 24px;color:#fff;background:#360044;overflow:hidden;text-transform:none;letter-spacing:0}
      .announcement.announcement--sale::before,
      .announcement.announcement--sale::after{position:absolute;top:-26px;width:150px;height:150px;content:"";pointer-events:none;opacity:1;transform:none}
      .announcement.announcement--sale::before{left:-34px;background:radial-gradient(circle at 22% 18%,#ff2e91 0 5px,transparent 6px),radial-gradient(circle at 36% 31%,#ff2e91 0 7px,transparent 8px),radial-gradient(circle at 15% 43%,#fff 0 4px,transparent 5px),radial-gradient(circle at 49% 10%,#ff2e91 0 4px,transparent 5px),radial-gradient(circle at 7% 62%,#ff2e91 0 8px,transparent 9px),radial-gradient(circle at 35% 59%,#ff2e91 0 5px,transparent 6px),radial-gradient(circle at 55% 46%,#ff2e91 0 3px,transparent 4px)}
      .announcement.announcement--sale::after{right:-34px;background:radial-gradient(circle at 78% 18%,#ff2e91 0 5px,transparent 6px),radial-gradient(circle at 64% 31%,#ff2e91 0 7px,transparent 8px),radial-gradient(circle at 85% 43%,#ffea1a 0 4px,transparent 5px),radial-gradient(circle at 51% 10%,#ff2e91 0 4px,transparent 5px),radial-gradient(circle at 93% 62%,#ff2e91 0 8px,transparent 9px),radial-gradient(circle at 65% 59%,#ff2e91 0 5px,transparent 6px),radial-gradient(circle at 45% 46%,#ff2e91 0 3px,transparent 4px)}
      .flash-sale-bar{position:relative;z-index:2;display:flex;min-height:84px;align-items:center;justify-content:center;gap:34px;max-width:980px;margin:0 auto}
      .flash-sale-bar__lead{display:flex;align-items:center;gap:14px;white-space:nowrap;font-size:1.2rem;font-weight:800;line-height:1}
      .flash-sale-bar__mark{display:grid;width:54px;height:54px;place-items:center;color:#360044;background:#ff4e9c;clip-path:polygon(50% 0,62% 25%,90% 15%,77% 43%,100% 60%,70% 67%,70% 100%,48% 76%,24% 97%,27% 65%,0 54%,27% 39%,13% 13%,42% 26%);font-size:1.25rem;font-weight:900;transform:rotate(-8deg)}
      .flash-sale-bar__timer{display:grid;grid-template-columns:repeat(4,90px);gap:8px}
      .flash-sale-unit{display:grid;min-height:84px;place-content:center;padding:8px;color:#26002f;background:#e7f148;border-radius:8px;text-align:center;box-shadow:inset 0 -2px 0 rgba(54,0,68,.08)}
      .flash-sale-unit strong{display:block;font-size:1.45rem;font-weight:500;line-height:1}
      .flash-sale-unit span{display:block;margin-top:7px;font-size:.72rem;font-weight:700;line-height:1;text-transform:uppercase}
      .flash-sale-bar.is-ended .flash-sale-bar__lead span:last-child{font-size:1.1rem}
      .flash-sale-bar.is-ended .flash-sale-unit{opacity:.72}

      @media(max-width:700px){
        :root{--announcement-height:150px}
        .brand.brand--image{width:68px;height:58px}
        .brand-logo-viewport{width:68px;height:58px;border-radius:10px}
        .brand-logo-viewport img{width:113px}
        .announcement.announcement--sale{min-height:150px;padding:12px 14px}
        .flash-sale-bar{min-height:126px;flex-direction:column;gap:12px}
        .flash-sale-bar__lead{font-size:.95rem}
        .flash-sale-bar__mark{width:38px;height:38px;font-size:.9rem}
        .flash-sale-bar__timer{grid-template-columns:repeat(4,minmax(58px,72px));gap:6px}
        .flash-sale-unit{min-height:66px;padding:6px}
        .flash-sale-unit strong{font-size:1.12rem}
        .flash-sale-unit span{margin-top:5px;font-size:.58rem}
      }
    `;
    document.head.appendChild(style);
  }

  function mountLogo(){
    const brand=document.querySelector(".site-header .brand");
    if(!brand) return false;
    if(brand.dataset.uploadedLogoInstalled==="true") return true;

    brand.classList.add("brand--image");
    brand.setAttribute("aria-label","GAIETY Modo Claro, início");
    brand.innerHTML=`
      <span class="brand-logo-viewport" aria-hidden="true">
        <img src="${LOGO_URL}" alt="" width="1254" height="1254" decoding="async">
      </span>
    `;
    brand.dataset.uploadedLogoInstalled="true";
    return true;
  }

  function renderCountdown(announcement){
    const remaining=Math.max(0,SALE_END_AT-Date.now());
    const totalSeconds=Math.floor(remaining/1000);
    const days=Math.floor(totalSeconds/86400);
    const hours=Math.floor((totalSeconds%86400)/3600);
    const minutes=Math.floor((totalSeconds%3600)/60);
    const seconds=totalSeconds%60;

    const values={days,hours,minutes,seconds};
    Object.entries(values).forEach(([key,value])=>{
      const target=announcement.querySelector(`[data-sale-${key}]`);
      if(target) target.textContent=String(value).padStart(2,"0");
    });

    const bar=announcement.querySelector(".flash-sale-bar");
    if(remaining===0 && bar){
      bar.classList.add("is-ended");
      const label=bar.querySelector(".flash-sale-bar__lead span:last-child");
      if(label) label.textContent="Oferta encerrada";
    }
  }

  function mountAnnouncement(){
    const announcement=document.querySelector(".announcement");
    if(!announcement) return false;
    if(announcement.dataset.flashSaleInstalled==="true") return true;

    announcement.className="announcement announcement--sale";
    announcement.removeAttribute("role");
    announcement.setAttribute("aria-label","Contagem regressiva da oferta especial");
    announcement.innerHTML=`
      <div class="flash-sale-bar">
        <div class="flash-sale-bar__lead">
          <span class="flash-sale-bar__mark" aria-hidden="true">G</span>
          <span>Oferta termina em:</span>
        </div>
        <div class="flash-sale-bar__timer" aria-live="polite">
          <div class="flash-sale-unit"><strong data-sale-days>00</strong><span>Dias</span></div>
          <div class="flash-sale-unit"><strong data-sale-hours>00</strong><span>Horas</span></div>
          <div class="flash-sale-unit"><strong data-sale-minutes>00</strong><span>Min</span></div>
          <div class="flash-sale-unit"><strong data-sale-seconds>00</strong><span>Seg</span></div>
        </div>
      </div>
    `;
    announcement.dataset.flashSaleInstalled="true";
    renderCountdown(announcement);
    window.setInterval(()=>renderCountdown(announcement),1000);
    return true;
  }

  function initialize(){
    loadSalesPageRefresh();
    installStyles();
    const mounted=()=>mountLogo()&&mountAnnouncement();
    if(mounted()) return;

    const observer=new MutationObserver(()=>{
      if(mounted()) observer.disconnect();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    window.setTimeout(()=>observer.disconnect(),12000);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",initialize,{once:true});
  else initialize();
})();
