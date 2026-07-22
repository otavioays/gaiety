# Teste de integridade do tracking

Após cada deploy relacionado ao tracking:

1. Abra a landing em uma janela anônima.
2. Aguarde o carregamento completo.
3. Confirme no console que `window.ConversionTracker?.version === 3`.
4. Clique em uma oferta e verifique se a URL da Shopify contém `ct_visitor_id`, `ct_session_id` e `ct_checkout_id`.
5. No export, valide que `page_view`, `sales_page_view`, `buy_button_click` e `checkout_started` compartilham o mesmo `visitor_id`.

Os arquivos `tracking-bridge.js`, `final-offer.js`, `script.js` e a página inicial são enviados com `Cache-Control: no-store` para impedir que versões antigas sobrevivam a novos deploys.
