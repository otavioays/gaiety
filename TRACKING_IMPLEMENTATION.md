# Rastreamento de conversão da GAIETY

A página de vendas já carrega automaticamente o tracker privado e envia:

- `page_view` ao abrir a landing page;
- `buy_button_click` ao clicar em qualquer CTA de compra;
- `add_to_cart` antes de abrir o link permanente da Shopify;
- IDs de visitante e sessão, UTMs e `fbclid` como atributos do carrinho.

O checkout e a compra precisam do Custom Pixel da Shopify, porque essas etapas acontecem no domínio da Shopify.

## Ativar o Custom Pixel

1. No Shopify Admin, abra **Configurações**.
2. Entre em **Eventos do cliente**.
3. Clique em **Adicionar pixel personalizado**.
4. Use o nome `GAIETY Conversion Tracker`.
5. Abra o arquivo [`shopify-custom-pixel.js`](./shopify-custom-pixel.js).
6. Copie todo o conteúdo e cole no editor do pixel.
7. Salve e clique em **Conectar**.
8. Nas permissões, selecione a finalidade de **Analytics** quando a Shopify solicitar.

O pixel assina os eventos padrão `checkout_started` e `checkout_completed`. A compra é enviada ao dashboard com o nome `purchase`.

## Teste completo

Abra a landing page com UTMs:

```text
https://otavioays.github.io/gaiety/?utm_source=facebook&utm_medium=paid_social&utm_campaign=relogio-julho&utm_content=criativo-01
```

Depois:

1. Clique em um botão de compra.
2. Inicie o checkout.
3. Para validar a compra sem afetar uma venda real, use o modo de teste disponível no gateway ou um pedido de teste da Shopify.
4. Abra o dashboard:

```text
https://analise-de-dados-fbads.vercel.app/dashboard
```

O funil esperado é:

```text
page_view -> buy_button_click -> add_to_cart -> checkout_started -> purchase
```

## Consultar diretamente no Neon

```sql
select
  event_name,
  visitor_id,
  session_id,
  utm_campaign,
  utm_content,
  client_timestamp,
  properties
from public.analytics_events
order by received_at desc
limit 100;
```

Os eventos da mesma jornada devem manter o mesmo `visitor_id` e `session_id` desde a landing page até a compra.
