# GAIETY — Ritual Nítido™

Landing page de pré-lançamento para o conceito **Ritual Nítido™**, um ritual visível de cinco passos criado para reduzir a fricção de começar.

## Estado comercial

Esta versão é uma página de **validação e lista fundadora**, não uma página de checkout.

O produto fotografado ainda apresenta lacunas materiais:

- a embalagem diz “11 Mushroom Blend”, enquanto o fornecedor descreve sete cogumelos;
- “5000 mcg” não possui denominador informado;
- fórmula, fabricante, origem, segurança cutânea e entrega transdérmica não foram comprovados;
- o enquadramento regulatório e as alegações finais ainda precisam ser definidos.

Por isso, a copy usa o patch apenas como âncora comportamental e separa claramente o que é visível, alegado e desconhecido.

## Imagens do produto

- `assets/mushroom-complex-patch.png`: foto original de baixa resolução recebida do fornecedor;
- `assets/mushroom-hero-lifestyle-916.webp`: foto promocional completa, preservada na proporção original e otimizada para 1024 × 1819.
- `assets/ancestral-mushroom-foraging.webp`: reconstituição artística gerada para a seção histórica; não é apresentada como registro arqueológico.
- `assets/modern-wellness-collage.webp`: recorte da colagem de referência usado no bloco sobre soluções rápidas da indústria.
- `assets/customer-avatar-sprite.webp`: quatro retratos inteiramente fictícios, gerados para uso ilustrativo nos avatares; não representam os autores das avaliações.

A foto serve apenas para apresentação. Ela não é usada como prova de embalagem física, composição, origem ou eficácia, e essa distinção aparece na própria página.

## Estrutura da página

- hero orientado a benefício, curiosidade e dor;
- seção de contexto ancestral e evidência humana com fontes abertas e limites explícitos;
- mecanismo comportamental `Sistema Ritual Visível™`;
- auditoria das contradições do produto;
- mecanismo de credibilidade `Padrão Prova Aberta™`;
- carrossel na hero com opiniões reproduzidas da página do produto, identificadas como relatos individuais e não como comprovação de eficácia;
- qualificação do público;
- garantia de transparência;
- urgência e escassez baseadas em ordem real de cadastro;
- FAQ com limites e incertezas;
- formulário de lista fundadora em modo de prévia.

## Rodar localmente

```bash
python3 -m http.server 4173
```

Depois, abra `http://127.0.0.1:4173`.

## Conectar a captação

O formulário está sem destino para impedir a falsa confirmação de um lead.

No `index.html`, configure o atributo abaixo com o endpoint oficial:

```html
<form data-waitlist-form data-endpoint="https://seu-endpoint-seguro.example/lead">
```

Contrato atual do envio:

- método: `POST`;
- `Content-Type`: `application/json`;
- campos: `name`, `email` e `consent`;
- resposta de sucesso: qualquer status HTTP `2xx`.

O evento `Lead` do Meta Pixel só é disparado depois de uma resposta de sucesso. O tracker próprio nunca recebe nome ou e-mail.

## Publicação

O workflow `.github/workflows/pages.yml` publica automaticamente a branch `main` no GitHub Pages.

Antes de publicar, é obrigatório:

1. conectar e testar o endpoint de captação;
2. publicar Termos e Política de Privacidade;
3. substituir qualquer informação condicional pela documentação aprovada;
4. revisar a página em desktop e mobile;
5. confirmar estoque, regras de prioridade e eventual garantia comercial.
