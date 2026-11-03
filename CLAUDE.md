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
- Áudio: Web Audio API direta, sem biblioteca.
- PWA feito à mão, sem biblioteca: `src/pwa/` (o plugin do Vite gera `dist/sw.js` com a lista de arquivos do build).

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

**Ajuste das regras:** todos os números (fatias da roleta, pontos por casa fechada, multiplicadores dos painéis, faixas de estrelas) ficam em `src/logica/regras.js`. Para mudar a pontuação depois de testar com crianças, basta editar esse arquivo.

### Níveis

| | Iniciante (5–7) | Intermediário (7–9) | Avançado (10+) |
|---|---|---|---|
| Painel | Palavra curta (2 a 8 letras): PATO, BOLA, CHUVA | Palavra mais longa (5 a 12 letras), com dígrafos: GALINHA | Frase curta (2 a 6 palavras, até 30 letras), com acentos e ç: PÃO COM MANTEIGA |
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

## Personagens

Elenco original ligado ao tema leitura/escrita. Cada jogador escolhe um, e o nome do personagem é o nome do jogador.

- Lalá Lápis (xilofone) · Bóris Borracha (tuba) · Capitão Til (sanfona) · Galinha Cedilha (clarinete)
- Tito Tatu (fagote) · Vó Vírgula (piano) · Zuca Zebra (bateria) · Sapo Soletra (kazoo/sintetizador)

Cada personagem é um SVG em seu próprio arquivo em `src/personagens/`, para trocar a arte sem mexer no jogo. O `Rosto.jsx` compartilhado faz as 4 expressões: **normal**, **pensando** (é a vez dele), **comemorando** (acertou) e **quase** (errou). A animação é só CSS. Os instrumentos entram com o áudio.

## Áudio

Tudo gerado por código com a **Web Audio API direta, sem biblioteca** (decisão: mais leve e mais seguro em TV antiga, e basta para efeitos e jingles curtos). Nenhum arquivo de áudio. Código em `src/audio/`.

- **Feito:**
  - Efeitos: giro da roleta (tiques que desaceleram junto com a animação), letra certa, letra errada, resolver errado, comemoração do painel resolvido (onda de notas e estouro de confete, sincronizada com a animação) e fim da partida.
  - Um jingle original por personagem, no timbre do seu instrumento. Toca ao escolher o personagem e, no competitivo, quando ele resolve um painel.
  - Painel de som (botão "Som"): volumes de **efeitos** e de **música**, cada um de 0 a 100% em passos de 10%, e botão para silenciar tudo. Funciona por setas + Enter.
  - **Música adaptativa**, original, escrita como dados em `src/audio/musica.js` (8 compassos em loop, melodias em escala pentatônica, timbres macios): `abertura` (início e configuração, andamento fixo) e quatro faixas de jogo (`saltitante`, `aventura`, `festa`, `suave`), escolhidas pelo tema da partida. **A música acompanha o jogo:** o andamento sobe conforme as letras do painel abrem, as camadas entram em ordem (base, arpejo cheio, melodia, bateria), cada painel começa um pouco mais rápido que o anterior e a música abaixa enquanto o painel comemora. No resultado ela para. Com o volume no máximo, fica na metade da força dos efeitos.
  - As preferências ficam em `localStorage`, com try/catch.
- **O som só liga depois do primeiro toque, clique ou tecla do jogador**, porque os navegadores bloqueiam antes disso.
- **Falta:** ouvir e ajustar as trilhas com ouvido humano (o Claude não ouve) e trocar faixas que cansarem.
- Regra de arquitetura: as regras do jogo não sabem que existe som. Os efeitos saem de um hook que só observa a mudança de estado (`useEfeitosDoJogo`).

## Escopo atual

1. Projeto Vite + React (JS) com `@vitejs/plugin-legacy`.
2. Telas: Início → Configuração da partida (modo, nível, nº de jogadores 2–4, personagem de cada um) → Jogo → Resultado.
3. Níveis **Iniciante, Intermediário e Avançado**.
4. Modos **Competitivo e Cooperativo** funcionando.
5. Banco de painéis em `src/data/iniciante.json`, `intermediario.json` e `avancado.json` (mais de 1000 itens por nível, carregados só quando o nível é escolhido), com o formato abaixo. A partida sorteia um tema e 3 painéis dele.
6. Navegação completa por setas + Enter, mouse e toque.
7. Áudio por código (efeitos, jingles e trilhas) e PWA, sem backend.

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

Textos só com letras maiúsculas (com acentos) e espaços, sem hífen, e no máximo 12 letras por palavra (no iniciante, no máximo 8, e a dica escrita curta, de preferência até uns 27 caracteres, em linguagem de criança), para caber no celular.

Regras do banco (conferidas em `src/data/palavras.test.js`): mínimo de 1000 itens por nível, sem repetição, cada tema com 3 itens ou mais. Cada item tem `emoji` **ou** `dica` escrita. Emoji só de Unicode antigo (até a versão 9), por causa de TV e navegador antigos; sem emoji seguro, usa-se dica escrita. A dica escrita não pode conter a palavra da resposta. Nada de marcas, pessoas reais ou palavras ofensivas.

As opções erradas do "Resolver" (só no iniciante) vêm de outros itens do mesmo nível, fora dos 3 painéis da partida, priorizando os que começam com a mesma letra, têm o mesmo tamanho ou são do mesmo tema.

## Deploy (feito em 03/11/2026)

- **No ar:** https://3palavras.devsaulo.com.br, na VPS Oracle (`ssh vps`, pasta `~/apps/3palavras`).
- **Como roda:** `Dockerfile` em duas etapas (Node gera o build do Vite, Nginx serve os arquivos) e `docker-compose.yml` com o container `tres-palavras`. A porta é `100.67.151.30:8810` (só no IP do Tailscale da VPS). Nginx em `deploy/nginx/default.conf` (cache longo para `/assets/`, `index.html` sempre revalidado, cabeçalhos de segurança, gzip).
- **Rota pública:** Cloudflare Tunnel "Server Oracle" (rota gerenciada no painel Zero Trust/Rede > Túneis, sem Nginx Proxy Manager), `3palavras.devsaulo.com.br` -> `http://100.67.151.30:8810`. O CNAME no DNS foi criado pelo próprio painel.
- **Publicar uma versão nova:** commitar e rodar `bash deploy/publicar.sh`. Ele envia o commit atual (`git archive`, sem precisar de push), reconstrói a imagem na VPS e confere o endereço público.
- **Versão e release:** a versão fica em `package.json` (hoje 1.1.0). A cada deploy: atualizar documentos (README, diário, CLAUDE.md), subir a versão (`npm version <x.y.z> --no-git-tag-version`), commitar, enviar `main` ao GitHub, criar a tag `vX.Y.Z` e o release (`gh release create`). O release 1.0.0 foi publicado em 03/11/2026.
- Os comandos Docker na VPS rodam sem `sudo` para o usuário `ubuntu`.
- O Cloudflare sobrescreve alguns cabeçalhos (por exemplo, o CSP chega só como `upgrade-insecure-requests`); isso não atrapalha o jogo.
- **PWA:** instalável e jogável sem internet depois da primeira visita (os 3 níveis ficam guardados). O service worker tenta a rede para a página e usa o cache para os arquivos com hash; uma versão nova aparece na visita seguinte, e o cache da versão anterior fica guardado para abas abertas. Arquivo novo fora de `public/` e `src/` precisa entrar no `Dockerfile`.
- **Falta:** teste na TV real pelo domínio de produção.

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

1. **V1:** Painel com roleta, 3 níveis, 2–4 jogadores locais, competitivo + cooperativo, navegação por controle, lógica pura em `src/logica/`.
2. Teste com crianças reais e ajuste de regras e pontuação.
3. Personagens SVG e tela de seleção. **(feito)**
4. Áudio (jingles + trilha de tema). **(feito: efeitos, jingles, volumes e trilhas; falta o ouvido do Saulo)**
5. Deploy em 3palavras.devsaulo.com.br e PWA **(feitos)**; falta o teste na TV real pelo domínio.
6. **Online:** backend Node + Socket.IO, salas privadas com código.
7. **Ranking** entre amigos (SQLite), reaproveitando o mesmo backend.
8. Mais conteúdo no banco de painéis.
