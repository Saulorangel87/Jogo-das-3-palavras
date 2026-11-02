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
  - Ações: `GIRAR`, `ESCOLHER_LETRA`, `RESOLVER`, `PROXIMO_PAINEL`.
  - Aleatoriedade vem de fora: a ação `GIRAR` traz o `sorteio`, para o servidor poder decidir o resultado.
  - Sem `window`, `document`, `localStorage` ou imports de React nesse módulo.
  - Motivo: o mesmo módulo será reutilizado no servidor Node para as partidas online.
- **Componentes React só desenham o estado e disparam ações.** Nenhuma regra de pontuação ou turno dentro de componente.
- **Acesso às palavras por uma função única**, `carregarPalavras(nivel)` em `src/data/`. Hoje lê o JSON; no futuro buscará da API.
- Testes simples das regras (Vitest) são bem-vindos, já que a lógica é pura.

## A mecânica: o Painel

Inspirada no formato clássico de descobrir letras em um painel. Só a mecânica: **nome, visual e personagens são nossos**. Nada de copiar programas de TV (painel azul e branco, logotipo, nome ou apresentador).

- Cada partida tem **3 painéis** do mesmo **tema**, resolvidos um por vez. O 1º vale ×1, o 2º ×2 e o 3º ×3 (o último sempre pode virar o jogo).
- O painel mostra uma casa fechada para cada letra, com a dica ao lado.
- Letras são escolhidas em um **teclado de botões**. A letra abre todas as casas onde aparece. Acentos e cedilha contam como a letra base: A abre Á e Ã; C abre Ç.
- **Resolver** pode ser tentado em qualquer momento da vez. No iniciante, o jogador escolhe entre **3 opções escritas**. Nos outros níveis, **preenche as casas fechadas** pelo teclado de botões, sem opções na tela, para a resposta não ficar óbvia. Acentos entram sozinhos: basta a letra base.
- Se a última letra abrir o painel inteiro, ele está resolvido por quem a escolheu.
- O próximo painel começa com o jogador seguinte a quem resolveu.
- **Ninguém é eliminado e ninguém perde pontos.** A roleta não tem fatia punitiva, e errar só passa a vez.

### Modos de jogo (escolhidos no início da partida)

**Competitivo (com roleta)**
- 2 a 4 jogadores em turnos, na mesma tela.
- Na sua vez, o jogador **gira a roleta** e escolhe uma letra, ou tenta **resolver**.
- Letra certa: ganha `valor da roleta × casas abertas × multiplicador do painel` e continua jogando.
- Letra errada: a vez passa.
- Resolver certo: ganha 20 pontos por casa ainda fechada × multiplicador do painel, recompensando quem descobre cedo.
- Resolver errado: a vez passa, e a opção fica riscada no iniciante. Um giro ainda não usado se perde.
- Vence quem tiver mais pontos após os 3 painéis. Empate é permitido.

**Cooperativo (sem roleta)**
- 2 a 4 jogadores na mesma equipe. A vez passa a **cada jogada**, certa ou errada, para todos participarem.
- Cada painel vale até 3 estrelas, conforme os erros da equipe (letra errada ou resolver errado): 3 estrelas com até 2 erros, 2 com até 4, 1 com 5 ou mais.
- Tela final mostra o total de estrelas da equipe (máximo 9).

A roleta fica fora do cooperativo porque lá não há pontos para ela sortear.

### Níveis

| | Iniciante (5–7) | Intermediário (7–9) | Avançado (10+) |
|---|---|---|---|
| Painel | Palavra de 2 sílabas: PATO, BOLA | Palavra mais longa, com dígrafos: GALINHA | Frase curta, com acentos e ç: PÃO COM MANTEIGA |
| Dica | Emoji | Emoji | Frase |
| Teclado | Letras da palavra + 4 extras | Alfabeto completo | Alfabeto completo |
| Resolver | 3 opções escritas | Preencher as casas | Preencher as casas |

Importante (iniciante): as opções do "Resolver" são **só texto**, sem imagem. Ler as opções é o exercício de leitura.

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

## Escopo atual

1. Projeto Vite + React (JS) com `@vitejs/plugin-legacy`.
2. Telas: Início → Configuração da partida (modo, nível, nº de jogadores 2–4, personagem placeholder de cada um) → Jogo → Resultado.
3. Níveis **Iniciante, Intermediário e Avançado**.
4. Modos **Competitivo e Cooperativo** funcionando.
5. Banco de painéis em `src/data/palavras.json`, com o formato abaixo. A partida sorteia um tema e 3 painéis dele.
6. Navegação completa por setas + Enter, mouse e toque.
7. Sem áudio, sem PWA, sem backend.

### Formato do banco de painéis

```json
{
  "iniciante": [
    {
      "tema": "Fazenda",
      "itens": [{ "texto": "PATO", "emoji": "🦆" }]
    }
  ],
  "avancado": [
    {
      "tema": "Cozinha",
      "itens": [{ "texto": "PÃO COM MANTEIGA", "dica": "Café da manhã simples" }]
    }
  ]
}
```

Textos só com letras maiúsculas (com acentos) e espaços, e no máximo 12 letras por palavra, para caber no celular.

As opções erradas do "Resolver" (só no iniciante) vêm de outros itens do mesmo nível, fora dos 3 painéis da partida, priorizando os que começam com a mesma letra, têm o mesmo tamanho ou são do mesmo tema.

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

1. **V1:** Painel com roleta, 3 níveis, 2–4 jogadores locais, competitivo + cooperativo, placeholders, navegação por controle, lógica pura em `src/logica/`.
2. Teste com crianças reais e ajuste de regras e pontuação.
3. Personagens SVG e tela de seleção.
4. Áudio (jingles + trilha de tema).
5. Deploy em 3palavras.devsaulo.com.br, PWA, teste na TV real.
6. **Online:** backend Node + Socket.IO, salas privadas com código.
7. **Ranking** entre amigos (SQLite), reaproveitando o mesmo backend.
8. Mais conteúdo no banco de painéis.
