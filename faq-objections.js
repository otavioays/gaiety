(function installObjectionFaq(){
  "use strict";

  function trackFaq(question){
    const tracker=window.ConversionTracker;
    if(!tracker||typeof tracker.track!=="function") return;
    try{
      Promise.resolve(tracker.track("faq_open",{
        question,
        placement:"objection_faq",
        page_version:"ritual-nitido-sales-v2"
      })).catch(()=>null);
    }catch(_error){}
  }

  function rewrite(){
    const faq=document.querySelector("#duvidas");
    const heading=faq?.querySelector(".faq-heading");
    const list=faq?.querySelector(".faq-list");
    if(!faq||!heading||!list) return false;
    if(faq.dataset.objectionFaqInstalled==="true") return true;

    heading.innerHTML=`
      <span class="eyebrow">Antes de escolher seu kit</span>
      <h2>As dúvidas que realmente podem impedir você de comprar.</h2>
      <p>Sem prometer superpoderes, sem esconder limitações e sem transformar um patch em tratamento médico.</p>
    `;

    list.innerHTML=`
      <details>
        <summary>Isso vai me deixar focado automaticamente?<span>+</span></summary>
        <p>Não. Modo Claro não faz a tarefa por você e não promete foco garantido. A proposta é reduzir a fricção do começo: você aplica o patch, escolhe uma única tarefa e começa o bloco antes de voltar a negociar consigo mesmo. O valor está em tornar essa transição mais visível e repetível.</p>
      </details>
      <details>
        <summary>Então o resultado vem do patch ou do Ritual Nítido?<span>+</span></summary>
        <p>A fórmula do patch foi desenvolvida para ajudar no foco e na clareza mental, reunindo sete cogumelos funcionais já pesquisados por seu potencial de apoiar atenção, cognição, energia e constância. O Ritual Nítido complementa essa proposta ao transformar a aplicação em um sinal claro para escolher uma tarefa e começar.</p>
      </details>
      <details>
        <summary>O que eu devo esperar sentir e em quanto tempo?<span>+</span></summary>
        <p>É esperado perceber mais clareza mental, maior facilidade para organizar os pensamentos, começar a tarefa e permanecer no bloco com mais constância. A experiência tende a surgir como uma sensação gradual de mente mais alinhada e energia mais estável para trabalhar, estudar ou criar. O tempo e a intensidade podem variar de pessoa para pessoa.</p>
      </details>
      <details>
        <summary>Por que usar um patch em vez de café, cápsulas ou outro aplicativo?<span>+</span></summary>
        <p>Porque o formato elimina parte da fricção: não há bebida para preparar, pó para misturar, cápsula para engolir nem outro aplicativo para abrir. Depois de aplicado, o patch permanece como um sinal visível de que você escolheu uma tarefa. Ele não precisa substituir café, sono ou ferramentas de produtividade; ocupa um papel diferente dentro da rotina.</p>
      </details>
      <details>
        <summary>Quais cogumelos fazem parte da fórmula?<span>+</span></summary>
        <p>O suplemento reúne sete cogumelos funcionais: Cordyceps, Reishi, Chaga, Turkey Tail (Cauda-de-Peru), Maitake, Shiitake e Lion’s Mane (Juba-de-Leão). A embalagem contém 8 patches e informa 5000 mcg.</p>
      </details>
      <details>
        <summary>Onde o produto é fabricado?<span>+</span></summary>
        <p>O Mushroom Complex é fabricado nos Estados Unidos com controle de qualidade. A fabricação nos EUA segue padrões rigorosos de produção e verificação, oferecendo mais segurança e tranquilidade para quem valoriza a procedência do suplemento.</p>
      </details>
      <details>
        <summary>Como eu uso o Ritual Nítido na prática?<span>+</span></summary>
        <p>Aplique um patch sobre a pele limpa, seca, sem irritação e, de preferência, com poucos pelos. Depois escolha uma tarefa específica, elimine as distrações mais óbvias e comece imediatamente. A regra é simples: 1 patch, 1 tarefa, 1 bloco claro. Siga também todas as instruções presentes na embalagem do lote recebido.</p>
      </details>
      <details>
        <summary>O patch fica preso? Posso suar, treinar ou tomar banho?<span>+</span></summary>
        <p>A aderência melhora quando a pele está completamente limpa e seca e quando toda a superfície é pressionada após a aplicação. Água, suor intenso, oleosidade e atrito podem reduzir a fixação. A experiência pode variar de acordo com a pele e a atividade.</p>
      </details>
      <details>
        <summary>E se eu tiver pele sensível?<span>+</span></summary>
        <p>Não aplique sobre pele irritada, ferida ou sensibilizada. Suspenda o uso se aparecer vermelhidão, coceira, ardor ou desconforto. Pessoas com histórico de reação a adesivos ou alergia a cogumelos devem conversar com um profissional de saúde antes de usar.</p>
      </details>
      <details>
        <summary>Posso usar junto com café, suplementos ou medicamentos?<span>+</span></summary>
        <p>Não podemos garantir combinações individualmente. Quem usa medicamentos, outros suplementos, está grávida, amamentando ou possui alguma condição de saúde deve consultar um profissional antes do uso. Modo Claro não foi criado para substituir medicamento, sono, alimentação ou acompanhamento profissional.</p>
      </details>
      <details>
        <summary>Isso trata TDAH, ansiedade, depressão ou esgotamento?<span>+</span></summary>
        <p>Não. Modo Claro é apresentado como um ritual vestível de bem-estar para blocos de trabalho, estudo ou criação. Não diagnostica, trata, cura ou previne doenças e não deve ser usado como alternativa a tratamento médico ou psicológico.</p>
      </details>
      <details>
        <summary>Por que vêm 8 patches? Qual kit tem o melhor custo por uso?<span>+</span></summary>
        <p>O pacote com 8 patches funciona como uma entrada de menor compromisso para experimentar o ritual em oito blocos importantes. Uma unidade custa R$83, cerca de R$10,38 por patch. O kit com duas unidades custa R$150 por 16 patches, cerca de R$9,38 por patch, além de economizar R$16 em comparação com duas unidades compradas separadamente.</p>
      </details>
      <details>
        <summary>E se eu usar e não perceber diferença?<span>+</span></summary>
        <p>Essa possibilidade existe. Para avaliar de forma mais justa, use o patch em contextos semelhantes, escolha uma tarefa concreta e observe se houve mudança na facilidade de começar, permanecer e concluir o bloco. Os resultados individuais podem variar.</p>
      </details>
    `;

    const details=Array.from(list.querySelectorAll("details"));
    details.forEach(item=>{
      item.addEventListener("toggle",()=>{
        if(!item.open) return;
        details.forEach(other=>{if(other!==item) other.open=false;});
        const question=(item.querySelector("summary")?.textContent||"").replace("+","").trim();
        trackFaq(question.slice(0,160));
      });
    });

    faq.dataset.objectionFaqInstalled="true";
    return true;
  }

  function initialize(){
    if(rewrite()) return;
    const observer=new MutationObserver(()=>{
      if(rewrite()) observer.disconnect();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    window.setTimeout(()=>observer.disconnect(),12000);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",initialize,{once:true});
  else initialize();
})();