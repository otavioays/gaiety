# GAIETY Classic — Landing Page

Landing page responsiva construída a partir das características visuais do design system enviado:

- fundo escuro cinematográfico;
- navegação em cápsula com vidro fosco;
- grade estrutural atmosférica;
- tipografia Inter, JetBrains Mono e Barlow Condensed;
- títulos condensados em grande escala;
- cards translúcidos com bordas discretas;
- animações leves de entrada;
- acentos em champanhe e prata;
- foto principal imediatamente abaixo da promessa;
- CTA fixo no celular.

## Arquivos

- `index.html`: estrutura e copy da página;
- `styles.css`: identidade visual e responsividade;
- `script.js`: animações, FAQ e link global do checkout;
- `assets/gaiety-classic-hero.webp`: imagem principal fornecida.

## Configurar o checkout

Abra `script.js` e substitua:

```js
const checkoutUrl = "https://seu-checkout.com";
```

pelo endereço real do seu checkout.

## Antes de publicar

1. Substitua os links de política, trocas e contato no rodapé.
2. Confirme o preço de R$ 297,00.
3. Confirme se embalagem e envio rastreado fazem parte da oferta.
4. Adicione CNPJ, razão social e canais de atendimento.
5. Publique somente informações técnicas verificadas.
6. Hospede a pasta em GitHub Pages, Vercel, Netlify ou servidor próprio.

## Abrir localmente

Basta abrir `index.html` no navegador. Para testar de forma mais fiel, utilize um servidor local:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.
