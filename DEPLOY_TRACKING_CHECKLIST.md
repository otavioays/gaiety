# Checklist de tracking após deploy

1. Abra a landing em janela anônima.
2. Confirme no console que `window.ConversionTracker?.version === 3`.
3. Gere uma visita nova, clique em uma oferta e avance até o checkout.
4. Verifique que a URL contém `ct_visitor_id`, `ct_session_id` e `ct_checkout_id`.
5. No export, confirme que `page_view`, `sales_page_view`, `buy_button_click` e `checkout_started` compartilham o mesmo `visitor_id`.

O `vercel.json` envia `Cache-Control: no-store` para a página inicial e para os scripts críticos de tracking e checkout, evitando que versões antigas sobrevivam a um novo deploy.
