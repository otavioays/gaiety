(function installBrandLogo(){
  "use strict";

  const LOGO_URL="https://cdn.shopify.com/s/files/1/1027/4285/1953/files/gaiety-logo-original.png?v=1784562981";

  function installStyles(){
    if(document.querySelector("style[data-brand-logo-style]")) return;
    const style=document.createElement("style");
    style.dataset.brandLogoStyle="";
    style.textContent=`
      .brand.brand--image{display:inline-flex;width:80px;height:68px;align-items:center;justify-content:center;overflow:visible}
      .brand-logo-viewport{position:relative;display:block;width:80px;height:68px;overflow:hidden;border-radius:12px;flex:0 0 auto}
      .brand-logo-viewport img{position:absolute;top:50%;left:50%;width:132px;max-width:none;height:auto;transform:translate(-50%,-50%);filter:drop-shadow(0 5px 10px rgba(54,0,68,.08))}
      @media(max-width:700px){
        .brand.brand--image{width:68px;height:58px}
        .brand-logo-viewport{width:68px;height:58px;border-radius:10px}
        .brand-logo-viewport img{width:113px}
      }
    `;
    document.head.appendChild(style);
  }

  function mount(){
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

  function initialize(){
    installStyles();
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