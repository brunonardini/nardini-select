# Nardini Select

Home institucional em Next.js, React e TypeScript. Usa fontes locais e os arquivos aprovados da marca.

## Executar

Requer Node.js 20.9 ou superior.

Crie um arquivo `.env` na raiz do projeto. Ele fica fora do Git. A variável `WHATSAPP_NUMBER` é o telefone usado no redirecionamento para o WhatsApp: somente dígitos, com código do país, sem `+`, espaços ou pontuação. No ambiente de desenvolvimento, um número fictício basta para a rota funcionar:

```ini
WHATSAPP_NUMBER=5511999999999
```

Em produção, defina o número real da loja na mesma variável, no ambiente do servidor.

```sh
npm ci
npm run dev
```

Para produção local:

```sh
npm run build
npm run start
```

Se a porta 3000 estiver ocupada: `npm run start -- --port 3100`.

## Estrutura

- `app/page.tsx`: conteúdo e cinco seções da home.
- `app/globals.css`: identidade visual, altura mínima de 100vh e responsividade.
- `app/header.tsx`: navegação e menu mobile.
- `app/contato/whatsapp/route.ts`: redirecionamento para o WhatsApp. O número vem de `WHATSAPP_NUMBER` e fica fora do texto da página e dos componentes cliente; o destino continua visível ao abrir o serviço.
- `public/images`: somente os arquivos usados pela página. A fachada exibida tem a faixa do telefone ocultada; o original permanece em `marca/`.
- `design/home-content-v3.md`: conteúdo aprovado e requisitos.
- `scripts/check-page.cjs`: verificação no navegador; requer Playwright disponível (`PLAYWRIGHT_MODULE` pode indicar a instalação) e Edge. Executar com o servidor na porta 3100. Verifica cinco viewports e salva os prints em `.impeccable/review/`.

Não há catálogo, preços, carrinho, feed do Instagram ou publicação em hospedagem configurada. Os links de mapas, Instagram e WhatsApp estão ativos.
