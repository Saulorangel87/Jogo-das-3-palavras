# 3 Palavras — Jogo de leitura para navegador e Smart TV

Jogo de palavras para ajudar crianças a aprender a ler, com níveis que vão até adultos.
Roda no navegador (PC, celular) e na Smart TV (controle remoto).
Domínio de produção: **3palavras.devsaulo.com.br**

## Como trabalhar neste projeto

- Responda e escreva textos da interface em **português do Brasil**.
- Trabalhe em passos pequenos. Ao terminar cada passo, explique brevemente o que mudou e por quê.
- Não adicione dependências sem necessidade. Pergunte antes de adicionar bibliotecas grandes.
- Todo conteúdo (personagens, músicas, textos, imagens) deve ser **original**. Nada copiado, nada parecido com personagens ou marcas conhecidas.
- Seja direto: se uma ideia não vale o esforço ou existe solução mais simples, diga.

## Stack

- React + Vite, **JavaScript** (sem TypeScript por enquanto).
- CSS puro (CSS Modules ou um arquivo por componente). Sem framework de UI.
- Sem backend. Dados em JSON dentro do projeto. Progresso/configurações em `localStorage` (sempre com try/catch).
- `@vitejs/plugin-legacy` para compatibilidade com navegadores de Smart TV (Chromium antigo em Tizen/webOS).
- PWA (offline) fica para uma versão posterior.

## Arquitetura (preparada para online e ranking)

O jogo começa 100% local, mas **vai ganhar multijogador online e ranking**. Por isso, desde a V1:

- **Regras do jogo em JavaScript puro, sem React**, em `src/logica/`.
  - Formato: `proximoEstado = aplicarAcao(estado, acao)` (estilo reducer).
  - Ações: `REVELAR`, `ARRISCAR`, `PROXIMA_PALAVRA` etc.
  - Sem `window`, `document`, `localStorage` ou imports de React nesse módulo.
  - Motivo: o mesmo módulo será reutilizado no servidor Node para as partidas online.
- **Componentes React só desenham o estado e disparam ações.** Nenhuma regra de pontuação ou turno dentro de componente.
- **Acesso às palavras por uma função única**, `carregarPalavras(nivel)` em `src/data/`. Hoje lê o JSON; no futuro buscará da API.
- Testes simples das regras (Vitest) são bem-vindos, já que a lógica é pura.

## A mecânica

- Cada rodada tem **3 palavras escondidas** do mesmo **tema** (ex.: Fazenda).
- As palavras são resolvidas **uma por vez**.
- Na sua vez, o jogador pode:
  1. **Revelar** o próximo pedaço da palavra (sílaba no iniciante, letra nos outros níveis). No máximo **1 revelação por vez**. Revelar **não** encerra a vez: em seguida o jogador precisa arriscar.
  2. **Arriscar** a palavra inteira (com ou sem revelar antes).
- A vez só passa quando o jogador erra o chute. Quem acerta resolve a palavra, e a próxima palavra começa com o jogador seguinte a ele.
- **Penalidades:** cada pedaço revelado e cada chute errado contam igualmente na pontuação e nas estrelas. Sem isso, chutar até acertar seria sempre a melhor jogada e revelar nunca compensaria.
- **Ninguém é eliminado e ninguém "perde" de forma punitiva.** Se a palavra for totalmente revelada, o jogador da vez ainda precisa escolher a opção certa (sempre dá para terminar).

### Modos de jogo (escolhidos no início da partida)

**Competitivo**
- 2 a 4 jogadores em turnos, na mesma tela.
- Palavras 1, 2 e 3 valem 10, 20 e 30 pontos (a última sempre pode virar o jogo).
- Cada penalidade (pedaço revelado ou chute errado) desconta 30% do valor da palavra (mínimo de 30% do valor).
- Errou o chute: a opção errada fica descartada (riscada), a palavra perde valor e a vez passa.
- Vence quem tiver mais pontos após as 3 palavras. Empate é permitido.

**Cooperativo**
- 2 a 4 jogadores na mesma equipe, revezando a vez (todos participam).
- Cada palavra vale até 3 estrelas: 3 sem nenhuma penalidade, 2 com 1 penalidade, 1 com 2 ou mais (penalidade = pedaço revelado ou chute errado).
- Errou o chute: a opção errada fica descartada, a palavra perde uma estrela (mínimo de 1) e a vez passa.
- Tela final mostra o total de estrelas da equipe (máximo 9).

### Níveis

| | Iniciante (5–7) | Intermediário (7–9) | Avançado (10+) |
|---|---|---|---|
| Palavras | 2 sílabas simples (CV): PATO, BOLA | 3 sílabas, sílabas complexas e dígrafos | Longas, acentos, ç, s/ss, x/ch |
| Pedaço revelado | Sílaba | Letra | Letra |
| Dica | Emoji visível | Emoji ou frase | Frase/definição |
| Arriscar | Escolher entre 3 palavras **escritas** | Montar com peças | Montar com peças |
| Trio | Mesmo tema | Mesmo tema | As 3 palavras formam uma frase |

Importante (iniciante): as 3 opções do "Arriscar" são **só texto**, sem imagem. Ler as opções é o exercício de leitura.

## Smart TV (obrigatório desde a V1)

- Toda a interação deve funcionar **só com setas + Enter** (controle remoto), além de mouse e toque.
- Nunca usar campo de texto livre. Toda entrada é por botões/peças.
- Elemento em foco sempre muito visível (borda grossa + leve aumento de escala).
- Ordem de navegação lógica nas grades (setas movem o foco espacialmente).
- Tecla Voltar/Escape volta à tela anterior.
- Interface para "3 metros de distância": fontes grandes, alto contraste, margem de segurança de ~5% nas bordas.
- Layout funciona de 360px (celular) até 1920x1080 (TV).

## Personagens (versões futuras)

Elenco original ligado ao tema leitura/escrita. Cada jogador escolhe um.
Na V1, usar **placeholders**: círculo colorido com a inicial e o nome.

- Lalá Lápis (xilofone) · Bóris Borracha (tuba) · Capitão Til (sanfona) · Galinha Cedilha (clarinete)
- Tito Tatu (fagote) · Vó Vírgula (piano) · Zuca Zebra (bateria) · Sapo Soletra (kazoo/sintetizador)

Futuro: SVG original com 4 expressões (normal, pensando, comemorando, quase), animação via CSS.
Cada personagem fica em seu próprio componente/arquivo, para trocar a arte depois sem mexer no jogo.

## Áudio (versões futuras)

- Música original gerada por código (Tone.js / Web Audio): jingle curto por personagem + trilha em loop por tema.
- Tela inicial com "Aperte OK para começar" (navegadores bloqueiam áudio antes da primeira interação).
- Volume separado para música e efeitos, e botão de mudo.

## Escopo da V1 (fazer agora)

1. Projeto Vite + React (JS) com `@vitejs/plugin-legacy`.
2. Telas: Início → Configuração da partida (modo, nº de jogadores 2–4, personagem placeholder de cada um) → Jogo → Resultado.
3. Apenas **nível Iniciante**.
4. Modos **Competitivo e Cooperativo** funcionando.
5. Banco de palavras em `src/data/palavras.json`, com o formato abaixo. A rodada sorteia um tema e 3 palavras dele.
6. Navegação completa por setas + Enter, mouse e toque.
7. Sem áudio, sem PWA, sem backend.

### Formato do banco de palavras

```json
{
  "iniciante": [
    {
      "tema": "Fazenda",
      "palavras": [
        { "palavra": "PATO", "silabas": ["PA", "TO"], "emoji": "🦆" }
      ]
    }
  ]
}
```

### Palavras iniciais (Iniciante)

- **Fazenda:** PATO 🦆, VACA 🐄, GALO 🐓, BODE 🐐, GATO 🐈
- **Comida:** BOLO 🎂, SUCO 🧃, UVA 🍇, PERA 🍐, COCO 🥥
- **Brinquedos:** BOLA ⚽, DADO 🎲, PIPA 🪁

As opções erradas do "Arriscar" vêm de outras palavras do mesmo nível, priorizando as que começam com a mesma sílaba ou têm o mesmo tamanho.

## Deploy (depois da V1)

- Build estático do Vite servido por container **Nginx** na VM Oracle.
- Exposto via Nginx Proxy Manager + Cloudflare em `3palavras.devsaulo.com.br`.
- Na VM, comandos Docker exigem `sudo`.

## Backend futuro (online + ranking) — NÃO fazer na V1

- **Node + Socket.IO** (reconexão automática e salas prontas), reutilizando `src/logica/`.
- **Servidor é a autoridade**: guarda o estado da partida e as palavras; os clientes só enviam ações.
- **SQLite** (volume Docker) para ranking e jogadores.
- Mesmo domínio: `/api` e `/socket.io` roteados pelo Nginx Proxy Manager (com WebSocket habilitado).
- Tratar desconexões com cuidado (Wi-Fi de criança cai, e o Cloudflare Tunnel já oscilou antes): jogador desconectado mantém a vaga por um tempo.

### Segurança das crianças (obrigatório no modo online)

- **Só salas privadas com código** (ex.: `GATO-42`), compartilhado entre os pais. Nada de partida com desconhecidos.
- **Sem chat livre.** Só reações prontas (emojis, "Boa!", "Quase!").
- **Só apelidos**, nunca nome completo, foto, idade ou escola.
- Coletar o mínimo de dados. Dados de crianças exigem consentimento dos pais (LGPD, art. 14). Se houver conta, ela é do responsável.
- Ranking por grupo de amigos/sala por padrão; ranking público só com apelidos e revisão.

## Roteiro

1. **V1:** iniciante, 2–4 jogadores locais, competitivo + cooperativo, placeholders, navegação por controle, lógica pura em `src/logica/`.
2. Teste com crianças reais e ajuste de regras e pontuação.
3. Personagens SVG e tela de seleção.
4. Áudio (jingles + trilha de tema).
5. Deploy em 3palavras.devsaulo.com.br, PWA, teste na TV real.
6. **Online:** backend Node + Socket.IO, salas privadas com código.
7. **Ranking** entre amigos (SQLite), reaproveitando o mesmo backend.
8. Níveis intermediário e avançado, modo frase.
