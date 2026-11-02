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
