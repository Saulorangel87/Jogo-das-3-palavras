# 3 Palavras

Jogo de leitura para ajudar crianças a aprender a ler, com níveis que vão até adultos. Roda no navegador (PC e celular) e na Smart TV, só com setas e Enter do controle remoto.

**Jogue em: https://3palavras.devsaulo.com.br**

## Como se joga

Cada partida tem **3 painéis** do mesmo tema. O painel mostra uma casa fechada para cada letra e uma dica (emoji ou frase). Na sua vez você escolhe uma letra: se ela existe, abre todas as casas onde aparece. Também pode tentar **resolver** a qualquer momento. Ninguém é eliminado e ninguém perde pontos; errar só passa a vez.

| | Iniciante (5–7 anos) | Intermediário (7–9) | Avançado (10+) |
|---|---|---|---|
| Painel | palavra curta (até 8 letras) | palavra longa (5 a 12 letras) | frase de 2 a 6 palavras |
| Resolver | escolher entre 3 opções escritas | preencher as casas fechadas | preencher as casas fechadas |

**Modos**
- **Competitivo:** 2 a 4 jogadores em turnos, com roleta. Letra certa vale `valor da roleta × letras abertas × multiplicador do painel` (×1, ×2 e ×3), e quem acerta continua. Vence quem tiver mais pontos.
- **Cooperativo:** 2 a 4 jogadores na mesma equipe, sem roleta. Cada painel vale até 3 estrelas, conforme os erros da equipe.

Há 8 personagens originais (Lalá Lápis, Bóris Borracha, Capitão Til, Galinha Cedilha, Tito Tatu, Vó Vírgula, Zuca Zebra e Sapo Soletra), cada um com seu instrumento e sua música. A trilha acompanha a partida: o andamento sobe conforme as letras abrem.

## Jogar online

Cada pessoa joga no seu aparelho, em uma sala privada. Quem cria a sala escolhe o nível e manda o convite, um link com o código da sala. Na primeira versão, só o modo competitivo, de 2 a 4 jogadores.

Feito pensando nas crianças: sem conta, sem chat, sem nome digitado (o nome é o do personagem) e sem lista de quem está online. Nada é gravado: a sala existe só na memória do servidor e some ao terminar. A resposta não sai do servidor antes da hora.

Se alguém perde a conexão, a vaga fica guardada por 2 minutos. Na própria vez, a pessoa tem 60 segundos para voltar, e depois a vez passa, sem perder pontos.

## Smart TV e acessibilidade

- Toda a interação funciona por setas, Enter e Voltar, além de mouse e toque. Não há campo de texto livre.
- Foco sempre bem visível, fontes grandes e margem de segurança nas bordas.
- Layout de 360 px (celular) até 1920×1080 (TV).
- Na LG, as setas e o som só funcionam depois de clicar na página com o ponteiro do controle. A tela inicial avisa.
- Build legado (`@vitejs/plugin-legacy`) para navegadores de TV antigos (Chromium 57 ou mais novo). Testado numa LG webOS 2024.

## Instalar e jogar sem internet

O jogo é um PWA: pode ser instalado pelo menu do navegador e, depois da primeira visita, funciona sem internet nos 3 níveis. O progresso fica só no aparelho.

## Rodando localmente

Precisa de Node.js 22 ou mais novo.

```bash
npm install
npm run dev        # servidor de desenvolvimento
npm test           # testes (Vitest)
npm run build      # build de produção em dist/
```

Para abrir na TV pela rede local: `npx vite --host --port 5180` e acesse `http://<IP do computador>:5180` no navegador da TV.

## Como o projeto é organizado

- `src/logica/` — **regras do jogo em JavaScript puro**, sem React nem `window` (`proximoEstado = aplicarAcao(estado, acao)`). Preparado para ser reutilizado no servidor das partidas online. Todos os números de pontuação ficam em `src/logica/regras.js`.
- `src/componentes/`, `src/telas/` — React só desenha o estado e dispara ações.
- `src/data/` — banco de painéis em JSON, um arquivo por nível (mais de 1000 itens cada), carregado só quando o nível é escolhido por `carregarPalavras(nivel)`. As regras do banco são conferidas em `palavras.test.js`.
- `src/audio/` — tudo sintetizado por código com a Web Audio API, sem arquivos de áudio nem bibliotecas: efeitos, jingles dos personagens e música adaptativa.
- `servidor/` — modo online: Node + Socket.IO, autoridade da partida, sem banco de dados. `src/online/` e `src/telas/Online.jsx` são o lado do navegador.
- `src/pwa/` — service worker feito à mão e plugin do Vite que gera a lista de arquivos, sem biblioteca.
- `src/personagens/` — um SVG por personagem. `src/fundos/` — papéis de parede em SVG por tela.
- `docs/DIARIO.md` — diário das etapas. `CLAUDE.md` — regras e decisões do projeto.

Todo o conteúdo (personagens, músicas, textos e imagens) é original.

## Publicação

O site roda em um container Nginx na VPS, atrás de um Cloudflare Tunnel, e o Nginx repassa o modo online a um segundo container.

```bash
git commit ...                # a árvore precisa estar limpa
bash deploy/publicar.sh       # envia o commit, reconstrói a imagem e confere o endereço público
```

Arquivos: `Dockerfile`, `servidor/Dockerfile`, `docker-compose.yml` e `deploy/nginx/`.

## Próximos passos

- Modo cooperativo online e ranking entre amigos.
- Mais conteúdo no banco de painéis.
