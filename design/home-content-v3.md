# Home v3 — composição leve

> Atualizado conforme o manual da marca (v2): paleta oficial, hero no formato da capa do manual, selo oficial e tom de voz focado em cães. As regras visuais estão em `DESIGN.md`.

Esta revisão substitui a organização visual da versão anterior (v2). Os três pilares e suas categorias permanecem; as seções de diferenciais e feed foram removidas a pedido do usuário.

## Regras comuns

- Cinco seções principais: hero, posicionamento, portfólio, localização e contato. Cada uma com `min-height: 100vh`; usar também `min-height: 100svh` para acompanhar o viewport móvel. Não usar altura fixa: o conteúdo pode ultrapassar a tela. Rodapé é parte do encerramento de contato.
- Usar apenas a paleta oficial do manual (Café Profundo, Terracota, Argila, Areia, Off-white), com grandes áreas claras e respiro. Sem caixas de fundo por pilar, cards aninhados, sombras, bordas decorativas, listas numeradas ou fotos individuais de categorias.
- Texto, botões e imagens independentes na implementação. Não rasterizar texto ou interações.

## Hero

Composição da capa do manual: logo horizontal e texto sobre off-white à esquerda; à direita, um painel Café Profundo de altura total com a haste terracota do N (corte diagonal) e o cão `public/images/hero-weimaraner-transparente.png`. A navegação fica sobre o painel, em off-white. No mobile: cabeçalho, texto e, abaixo, o painel com o cão. Sem selo no hero.

Título: Mais bem-estar começa com **boas escolhas**.

Texto: Produtos selecionados com critério para cuidar, estimular e enriquecer a vida do seu cão.

Botão primário: Conheça nossa seleção ↓, âncora para o portfólio.

Botão secundário: Visite nossa loja ↓, âncora para localização.

Nenhum endereço, marcador de mapa ou rótulo de localização no hero.

## Posicionamento

Título em três linhas à esquerda: Qualidade, / especialização / e curadoria. Texto aprovado na revisão anterior à direita; selo oficial da marca (`public/images/selo.png`, sem recorte nem redesenho) à esquerda do título, sobre fundo Café Profundo. Fechamento: "Mais seleção. Menos convencional." No mobile empilhar com respiro.

## Portfólio

Título: Uma curadoria. **Três compromissos.** A segunda frase usa o terracota de destaque.

Três grupos sem numeração, caixas ou cards. Uma ilustração por pilar, desenho artístico em marrom/bege/laranja com formas geométricas discretas inspiradas na marca. Cada grupo mantém título, conceito curto, categorias em texto simples e mensagem de destaque aprovada em v2.

- Seleção Criteriosa: Alimentação Natural; Petiscos Naturais e Recompensas.
- Bem-Estar e Desenvolvimento: Adestramento e Comportamento; Brinquedos e Enriquecimento Ambiental; Higiene e Bem-Estar.
- Experiência Premium: Comedouros e Acessórios Premium.

Desktop: três colunas abertas com bastante espaço. Mobile: grupos empilhados sem altura fixa, preservando legibilidade e categorias.

Remover por completo a seção "Por que escolher a Nardini Select?".

## Localização

Título: Estamos em Resende, RJ. Foto real da fachada, sem telefone visível na versão exibida. Endereço aprovado: Avenida Riachuelo, 350, Liberdade, Resende, RJ. CEP 27521-171.

Um único ícone de mapa em toda a seção. Botão "Como chegar" sem seta, abrindo o mapa com o endereço como destino. Não duplicar o marcador no título, endereço e botão.

## Contato

Título: Vamos conversar?

Duas colunas independentes e abertas no desktop, sem caixas pesadas:

- WhatsApp: CTA "Fale com a gente", texto breve convidando a tirar dúvidas e conhecer a seleção.
- Instagram: CTA "Siga @nardiniselect", texto breve convidando a acompanhar novidades da marca.

Mobile: empilhar as duas colunas para manter áreas de toque e texto legíveis. Não exibir telefone. Remover o feed e a seção "Acompanhe a nossa matilha no Instagram". Nenhuma integração de feed necessária no escopo atual.

## Validação da próxima implementação

Verificar as cinco seções com altura medida >= viewport, os dois links de scroll e seus destinos, ausência de telefone na UI e na fotografia exibida, um único marcador de mapa e nenhum feed. Prévia raster é estudo visual; não prova comportamento CSS ou interações.
