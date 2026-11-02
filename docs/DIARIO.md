# Diário do projeto

Registro de cada etapa: o que mudou e por quê. A entrada mais recente fica no fim.

## 2026-11-02 — Etapa 1: ajuste das regras

**O que mudou:** as regras da mecânica no `CLAUDE.md`.

- Revelar não encerra mais a vez. O jogador revela no máximo 1 pedaço por vez e depois precisa arriscar.
- A vez só passa quando o jogador erra. Quem acerta resolve a palavra, e a próxima começa com o jogador seguinte a ele.
- Chute errado agora custa o mesmo que um pedaço revelado, na pontuação e nas estrelas.

**Por quê:** nas regras originais, revelar quase nunca compensava. No cooperativo, bastava chutar até acertar para fazer sempre 9 estrelas. No competitivo, revelar reduzia o valor da palavra e só ajudava o próximo jogador.

**Pontos a observar no teste com crianças:**

- UVA é a única palavra fora do padrão CV (U-VA).
- 🪁 e 🧃 (2019) e 🥥 (2017) podem não aparecer em TVs antigas. Conferir no teste na TV real.

## 2026-11-02 — Etapa 2: estrutura do projeto

**O que mudou:** projeto criado com Vite, React (JS), `@vitejs/plugin-legacy` e Vitest.

**Por quê:** é a base prevista no `CLAUDE.md`. O alvo do pacote legado é Chromium 57, a primeira versão com CSS Grid. Por isso o CSS do jogo evita recursos mais novos, como `gap` em flexbox e `clamp()`.

## 2026-11-02 — Etapa 3: regras do jogo e banco de palavras

**O que mudou:**

- `src/logica/jogo.js`: partida em formato `aplicarAcao(estado, acao)`, com pontuação, estrelas e turnos.
- `src/logica/rodada.js`: sorteio do tema, das 3 palavras e das opções.
- `src/data/`: banco de palavras e `carregarPalavras(nivel)`.
- Testes com Vitest para as regras e os dados.

**Por quê:** as regras ficam separadas da interface para serem reaproveitadas no servidor do modo online.

**Decisão:** as opções erradas nunca são outras palavras do trio da rodada. Assim, uma opção não entrega a resposta de outra palavra.

## 2026-11-02 — Etapa 4: navegação por controle remoto

**O que mudou:** `src/navegacao/` move o foco pelas setas conforme a posição dos botões na tela, trata as teclas Voltar (Escape, Backspace, Tizen e webOS) e recupera o foco quando um botão some.

**Por quê:** toda a interação precisa funcionar só com setas + Enter. Segurar o OK também não avança várias telas de uma vez.

## 2026-11-02 — Etapa 5: telas da V1

**O que mudou:** telas de Início, Configuração, Jogo e Resultado, com personagens provisórios (círculo com a inicial).

**Decisões de interface:**

- As 3 opções ficam sempre visíveis, sem um botão "Arriscar" antes. É um passo a menos no controle remoto, e a leitura das opções continua sendo o exercício.
- A configuração é feita em passos: modo, número de jogadores e personagem de cada um. O nome do jogador é o nome do personagem, então não há campo de texto.
- Voltar durante a partida pergunta antes de sair, para uma criança não perder o jogo sem querer.

**Verificado:**

- 25 testes passando e build de produção com pacote legado gerado.
- Só com teclado em 1920x1080: configuração completa, revelar, errar e o aviso de saída.
- Com cliques: partida competitiva completa até o resultado.
- Em 360x640: sem estouro de largura, e o jogo com 4 jogadores cabe na tela. A seleção de personagem rola 30px.
- Pontuação final do cooperativo: só nos testes de regras, não na tela de resultado.

**Ainda não verificado:** navegador antigo ou TV real, e toque em celular de verdade.

**Próximo passo do roteiro:** teste com crianças reais.

## 2026-11-02 — Etapa 6: nova mecânica, o Painel

**O que mudou:** a mecânica foi trocada no `CLAUDE.md`, a pedido do Saulo, a partir de uma imagem de um programa de TV. Agora os jogadores escolhem letras em um painel, com roleta no competitivo e 3 níveis, incluindo frases.

**Decisões:**

- Só a mecânica vem do formato clássico. Nome e visual são nossos, porque o `CLAUDE.md` proíbe parecer com marcas conhecidas.
- A roleta não tem fatia punitiva, para manter a regra de que ninguém perde de forma punitiva.
- A roleta fica só no competitivo: no cooperativo não há pontos para ela sortear.
- Resolver é sempre escolher entre 3 opções escritas. Montar com peças fica para depois.
