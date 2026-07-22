(function installScratchImageSwap(){
  "use strict";

  const PRE_REVEAL_IMAGE_URL="https://cdn.shopify.com/s/files/1/1027/4285/1953/files/gaiety-raspadinha-pre-reveal.png?v=1784747226";
  const REWARD_IMAGE_URL="https://cdn.shopify.com/s/files/1/1027/4285/1953/files/gaiety-raspadinha-3-mais-2-gratis.png?v=1784745739";
  const MODAL_SELECTOR="[data-scratch-modal]";
  const IMAGE_SELECTOR=".scratch-product-halo--offer img";

  function installStyle(){
    if(document.querySelector("style[data-scratch-image-swap-style]")) return;
    const style=document.createElement("style");
    style.dataset.scratchImageSwapStyle="";
    style.textContent=`
      ${IMAGE_SELECTOR}{transition:opacity .18s ease}
      ${IMAGE_SELECTOR}.is-switching{opacity:.28}
      @media(prefers-reduced-motion:reduce){${IMAGE_SELECTOR}{transition:none}}
    `;
    document.head.appendChild(style);
  }

  function setImage(modal,image,src){
    if(!image || image.dataset.currentScratchImage===src) return;
    image.classList.add("is-switching");
    image.src=src;
    image.dataset.currentScratchImage=src;
    const finish=()=>requestAnimationFrame(()=>image.classList.remove("is-switching"));
    if(image.complete) finish();
    else image.addEventListener("load",finish,{once:true});
  }

  function syncImage(modal){
    const image=modal.querySelector(IMAGE_SELECTOR);
    if(!image) return;
    const revealed=modal.classList.contains("is-revealed");
    setImage(modal,image,revealed?REWARD_IMAGE_URL:PRE_REVEAL_IMAGE_URL);
  }

  function bindModal(modal){
    if(!modal || modal.dataset.scratchImageSwapBound==="true") return;
    modal.dataset.scratchImageSwapBound="true";
    syncImage(modal);

    const observer=new MutationObserver(()=>syncImage(modal));
    observer.observe(modal,{attributes:true,attributeFilter:["class","hidden"]});
  }

  function discover(){
    const modal=document.querySelector(MODAL_SELECTOR);
    if(modal) bindModal(modal);
  }

  installStyle();
  discover();

  const documentObserver=new MutationObserver(discover);
  documentObserver.observe(document.documentElement,{childList:true,subtree:true});

  document.addEventListener("click",event=>{
    if(!event.target.closest?.('[data-offer-button="2"]')) return;
    requestAnimationFrame(discover);
  },true);
})();
