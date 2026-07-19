# Rastreamento — Ritual Nítido™

Esta iteração mede interesse na validação. Não envia eventos de compra, carrinho ou checkout.

## Integrações preservadas

- Meta Pixel: `1002939839166097`;
- tracker privado: `https://analise-de-dados-fbads.vercel.app/tracker.js`;
- preview opcional do tracker com `?ct_tracker_preview=1`;
- telemetria rica de laboratório com `?ct_rich_telemetry=1`, sem afetar o tráfego normal.

## Identidade da oferta

```text
product_id: ritual-nitido
product_name: Ritual Nítido (pré-lançamento)
offer_stage: validation_waitlist
page_version: ritual-nitido-prelaunch-v1
```

## Eventos da landing page

- `page_view`: disparado pelo tracker carregado na página;
- `cta_impression`: quando 50% de um CTA entra no viewport, uma vez por placement/sessão;
- `waitlist_cta_click`: clique em qualquer elemento com `data-cta`;
- `section_view`: primeira visualização de 25% de cada seção com `data-section`;
- `faq_open`: abertura de uma pergunta;
- `waitlist_validation_error`: tentativa com campos inválidos;
- `waitlist_preview_submit`: formulário válido, mas ainda sem endpoint configurado;
- `waitlist_submit`: endpoint conectado e resposta `2xx`;
- `waitlist_submit_error`: falha no endpoint.

No modo de telemetria rica, `tracking-rich-preview.js` acrescenta contexto criativo, tempo real de exposição aos CTAs, profundidade de rolagem e geometria do viewport. O arquivo usa a mesma identidade `ritual-nitido` e não procura mais o checkout ou a variante do relógio anterior.

O Meta Pixel dispara `Lead` apenas junto de `waitlist_submit` bem-sucedido.

## Privacidade

Nome e e-mail são enviados somente ao endpoint definido em `data-endpoint`. Esses campos não entram em eventos do tracker privado. As propriedades de eventos incluem `pii_included: false` ou `pii_sent_to_tracker: false` para facilitar auditoria.

## Funil esperado nesta fase

```text
page_view → cta_impression → waitlist_cta_click → waitlist_submit
```

Enquanto o endpoint estiver vazio, o último passo será `waitlist_preview_submit`, e a interface informa que nenhum dado foi enviado.

## Verificação rápida

```bash
node --check script.js
node --check tracking-bridge.js
```

Depois de conectar o endpoint:

1. abrir a página com UTMs de teste;
2. clicar em CTAs de placements diferentes;
3. enviar um lead de teste autorizado;
4. confirmar que o backend recebeu os campos;
5. confirmar `waitlist_submit` no dashboard sem PII;
6. confirmar o evento `Lead` no Meta Events Manager.

Checkout, `add_to_cart` e Custom Pixel da Shopify não fazem parte desta etapa. Eles só devem voltar quando produto, variante e checkout do Ritual Nítido™ existirem e estiverem documentados.
