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
- O jogo local não usa backend; só o modo online usa o servidor em `servidor/`. Dados em JSON dentro do projeto. Progresso/configurações em `localStorage` (sempre com try/catch).
- `@vitejs/plugin-legacy` para compatibilidade com navegadores de Smart TV (Chromium antigo em Tizen/webOS).
- Áudio: Web Audio API direta, sem biblioteca.
- PWA feito à mão, sem biblioteca: `src/pwa/` (o plugin do Vite gera `dist/sw.js` com a lista de arquivos do build).

## Arquitetura (preparada para online e ranking)

O jogo começa 100% local, mas **vai ganhar multijogador online e ranking**. Por isso, desde a V1:

- **Regras do jogo em JavaScript puro, sem React**, em `src/logica/`.
  - Formato: `proximoEstado = aplicarAcao(estado, acao)` (estilo reducer).
  - Ações: `GIRAR`, `ESCOLHER_LETRA`, `RESOLVER`, `PROXIMO_PAINEL`. Só o servidor online usa `PASSAR_VEZ` e `MARCAR_SAIDA`.
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
- Letra errada: a vez passa (a menos que o jogador tenha o escudo).
- **Fatias da roleta** (14, em `FATIAS_ROLETA`, `src/logica/regras.js`; cada fatia tem `tipo`, `valor` e `peso`, e o peso é a largura: fatia estreita sai menos). Nenhuma tira pontos:
  - **Pontos** (5, 10, 15, 20, 25, 30, 40, 50): a letra certa vale `valor` por casa. A de **100** (jackpot) é a mais estreita.
  - **Bônus ×2** (`bonus`): a próxima letra certa vale em dobro. Fica marcado no placar (ficha ×2) até ser usado, e errar não o gasta. Gira de novo.
  - **Giro extra** (`giro-extra`): gira de novo sem gastar a vez. Não dá pontos.
  - **Letra grátis** (`letra-gratis`): abre uma letra aleatória do painel e paga `20 × casas × multiplicador do painel` (em dobro com o bônus). Nunca fecha o painel sozinha: se sobrar uma letra só, vira giro extra. Gira de novo. O servidor sorteia a letra (`sorteioLetra` na ação `GIRAR`).
  - **Escudo** (`escudo`): a próxima letra errada não passa a vez (um por jogador, ficha "Escudo"). Não protege de chute errado nem do fim do tempo. Gira de novo.
  - **Soneca** (`soneca`): a vez passa para o próximo, sem perder pontos nem poderes.
  - Quem cai em Bônus ou Escudo que já tem recebe giro extra, para não acumular. A letra grátis só aparece no painel quando a roleta para de girar.
- **Relógio da vez: 30 segundos** (`TEMPO_DA_VEZ_S` em `regras.js`), só no competitivo. Acabou o tempo, a vez passa sem erro e sem perder pontos, e o giro não usado se perde (ação `TEMPO_ESGOTADO`, jogada `tempo-esgotado`). O relógio reinicia quando o `turno` do estado muda: toda ação que muda o jogo sobe o `turno`, menos o giro. Acertar uma letra e continuar reinicia; girar não. A lógica é pura e não tem relógio: quem conta o tempo pede a ação (no jogo local, `Jogo.jsx`; no online, o servidor em `verificarPrazos`, com `turnoMs` em `servidor/salas.js`). Nos últimos 5 segundos o relógio fica vermelho e faz um tique para quem está na vez.
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

**Painéis de duas palavras (Avançado):** o sorteio (`sortearPaineis` em `src/logica/rodada.js`) garante pelo menos 1 painel de exatamente duas palavras por partida, se o tema tiver, e cada outra vaga tem 50% de chance de ser outra palavra dupla (`PAINEIS_MINIMOS_DE_DUAS_PALAVRAS` e `CHANCE_DE_DUAS_PALAVRAS` em `regras.js`). Os painéis são embaralhados depois, então a dupla não cai sempre no mesmo multiplicador. Medido no banco real em 2.000 partidas: de 67% das partidas com pelo menos uma dupla (média de 1,06 por partida) para 100% (média de 1,63).

Importante (iniciante): as opções do "Resolver" são **só texto**, sem imagem. Ler as opções é o exercício de leitura.

## Smart TV (obrigatório desde a V1)

- Toda a interação deve funcionar **só com setas + Enter** (controle remoto), além de mouse e toque.
- **LG (visto com `?diag`):** o navegador abre sem entregar as teclas à página; as setas e o som só funcionam depois de clicar nela com o ponteiro do controle. O jogo não consegue pedir o teclado de volta, então a tela inicial mostra um aviso quando reconhece TV. Navegador da LG testada: Chrome 87.
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
- **O som só liga depois de um gesto do jogador**, porque os navegadores bloqueiam antes disso. O jogo tenta liberar a cada gesto, porque nem todo gesto conta (seta do controle da TV, por exemplo).
- **Diagnóstico na TV:** abrir o site com `?diag` no endereço mostra teclas recebidas, foco, estado do áudio e volumes, e cada tecla toca um som. Nada é enviado.
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

Textos só com letras maiúsculas (com acentos) e espaços, sem hífen (palavras compostas com hífen entram escritas como dois blocos: `GUARDA CHUVA`, `BEIJA FLOR`, `SEGUNDA FEIRA`; o hífen não aparece na tela e a letra de graça vale para as duas partes), e no máximo 12 letras por palavra (no iniciante, no máximo 8, e a dica escrita curta, de preferência até uns 27 caracteres, em linguagem de criança), para caber no celular.

Regras do banco (conferidas em `src/data/palavras.test.js`): mínimo de 1000 itens por nível, sem repetição, cada tema com 3 itens ou mais. Cada item tem `emoji` **ou** `dica` escrita. Emoji só de Unicode antigo (até a versão 9), por causa de TV e navegador antigos; sem emoji seguro, usa-se dica escrita. A dica escrita não pode conter a palavra da resposta. Nada de marcas, pessoas reais ou palavras ofensivas.

As opções erradas do "Resolver" (só no iniciante) vêm de outros itens do mesmo nível, fora dos 3 painéis da partida, priorizando os que começam com a mesma letra, têm o mesmo tamanho ou são do mesmo tema.

## Deploy (feito em 03/11/2026)

- **No ar:** https://3palavras.devsaulo.com.br, na VPS Oracle (`ssh vps`, pasta `~/apps/3palavras`).
- **Como roda:** `Dockerfile` em duas etapas (Node gera o build do Vite, Nginx serve os arquivos) e `docker-compose.yml` com o container `tres-palavras`. A porta é `100.67.151.30:8810` (só no IP do Tailscale da VPS). Nginx em `deploy/nginx/default.conf` (cache longo para `/assets/`, `index.html` sempre revalidado, cabeçalhos de segurança, gzip).
- **Rota pública:** Cloudflare Tunnel "Server Oracle" (rota gerenciada no painel Zero Trust/Rede > Túneis, sem Nginx Proxy Manager), `3palavras.devsaulo.com.br` -> `http://100.67.151.30:8810`. O CNAME no DNS foi criado pelo próprio painel.
- **Publicar uma versão nova:** commitar e rodar `bash deploy/publicar.sh`. Ele envia o commit atual (`git archive`, sem precisar de push), reconstrói a imagem na VPS e confere o endereço público.
- **Versão e release:** a versão fica em `package.json` (hoje 1.3.3). A cada deploy: atualizar documentos (README, diário, CLAUDE.md), subir a versão (`npm version <x.y.z> --no-git-tag-version`), commitar, enviar `main` ao GitHub, criar a tag `vX.Y.Z` e o release (`gh release create`). O release 1.0.0 foi publicado em 03/11/2026.
- **Container endurecido:** usuário sem root (101), disco somente leitura, sem capacidades e `no-new-privileges`. O `publicar.sh` reconstrói com `--pull`, para receber correções das imagens base.
- Os comandos Docker na VPS rodam sem `sudo` para o usuário `ubuntu`.
- **Regras do Cloudflare para o jogo:** o host está na lista de exclusão da regra de cabeçalhos "Cabeçalho de segurança", então os cabeçalhos do Nginx valem (só o HSTS vem do Cloudflare). A Configuration Rule "3 Palavras - sem Web Analytics" desliga a medição só neste host, e a Cache Rule "3 Palavras - revalidar sw e manifesto" faz o navegador respeitar o `no-cache` do `/sw.js` e do manifesto. Mudar a CSP é em `deploy/nginx/seguranca.inc`.
- **PWA:** instalável e jogável sem internet depois da primeira visita (os 3 níveis ficam guardados). O service worker tenta a rede para a página e usa o cache para os arquivos com hash; uma versão nova aparece na visita seguinte, e o cache da versão anterior fica guardado para abas abertas. Arquivo novo fora de `public/` e `src/` precisa entrar no `Dockerfile`.
- **Telas compactas (1.3.2 e 1.3.3):** a tela do jogo cabe sem rolagem em celular em pé (360×640 a 390×780), celular deitado e TV (960×540 a 1920×1080). Celular em pé (`max-width: 600px` e `max-aspect-ratio: 1/1`): margens de 1,5vh, placar em uma fileira, teclado em 9 colunas, roleta de 7rem (6rem abaixo de 700 px de altura), topo em duas linhas (`.jogo-longo` para leitores de tela, `.jogo-curto` só visual). Paisagem: teclado em 13 colunas, roleta de 9rem, casas do painel de até 2,7rem. Ao mexer no layout do jogo, medir `scrollHeight - clientHeight` em iframes desses tamanhos, com o painel mais largo repetido para simular o pior caso (ver diário, etapas 42 e 43). A 1.3.3 estendeu o mesmo trabalho à sala de espera online (jogadores em duas colunas no celular) e ao resultado.
- **Borda a borda (1.3.1, experimento):** o `viewport` tem `viewport-fit=cover` e as margens de segurança (`.tela`, modais, faixa do online) somam `env(safe-area-inset-*)` às de TV. Serve para o fundo azul passar sob a barra de navegação do Android e tentar sumir a linha de 1 pixel na divisa; não resolveu a linha no celular do Saulo, que decidiu encerrar o assunto (ver diário, etapas 40 e 41).
- **Falta:** teste na TV real pelo domínio de produção.

## Modo online (no ar desde 03/11/2026, versão 1.2.0)

**Feito:** servidor em `servidor/` (Node + Socket.IO), telas em `src/telas/Online.jsx` e conexão em `src/online/`, carregadas só por quem joga online. Partida completa testada em produção com duas abas do Chrome. **Falta:** teste com aparelhos reais em redes diferentes e tela bloqueada; cooperativo; ranking (SQLite) continua para depois.

Decisões do Saulo: colegas em celular e PC; primeira versão só no competitivo; qualquer pessoa cria sala, sem conta; o convite é um link com o código da sala.

- **Servidor é a autoridade:** guarda o estado e as palavras, sorteia a roleta e confere de quem é a vez. O aparelho só pede jogadas. Regras em `src/logica/`, reaproveitadas; os números do online em `servidor/regrasOnline.js`.
- **Nada é gravado:** salas só na memória, apagadas ao terminar, sem ninguém ou depois de 30 minutos paradas. Sem conta, sem log de endereços ou jogadas.
- **A resposta nunca sai do servidor antes da hora:** `servidor/visao.js` troca as casas fechadas por `_` e esvazia os outros painéis. O cliente não recebe nenhum token alheio.
- **Código da sala:** 4 consoantes e 2 números (`BRTK-42`); sem vogal não forma palavra. Tentativas erradas limitadas por endereço.
- **Presença:** a conexão do Socket.IO confere o aparelho a cada 10 segundos. Estados só dentro da sala: `conectada`, `reconectando` (vaga guardada por 2 minutos, volta com token) e `saiu`. Quem cai na própria vez tem 60 segundos, depois a vez passa, sem perder pontos (na prática o relógio de 30 segundos da vez passa antes). Não existe lista de quem está online no site.
- **Rede:** o Nginx do site repassa `/socket.io/` ao container `tres-palavras-online`, que não tem porta publicada. Nada muda no Cloudflare, e `docker-compose.yml` sobe os dois.
- **Seguir para o próximo painel:** todos clicam (decisão do Saulo, mais equilibrado), com 15 segundos de contagem a partir de quando a palavra é resolvida. Só isso faz seguir: todos clicarem ou a contagem acabar. Quem caiu ainda conta, porque uma queda de segundos não pode fazer um clique valer por dois; só quem saiu de vez deixa de contar. O prazo fica em `servidor/regrasOnline.js`. No aparelho, o botão ignora cliques no primeiro segundo, para um toque duplo não pular a palavra.
- **Quem sai:** fica no placar marcado como "(saiu)" e não vence, mesmo com mais pontos. O resultado explica a saída.
- **Tela de jogo:** a mesma `Jogo.jsx`, com a prop `online`. Com ela, o estado vem do servidor, os botões travam fora da vez e a roleta gira quando o servidor avisa (`sala.giro`).
- **Em desenvolvimento:** `PORTA=3000 ORIGENS=http://localhost:5180 node servidor/principal.js` (depois de `npm install` em `servidor/`) e `npx vite --port 5180`.

### Segurança das crianças (obrigatório no modo online)

- **Só salas privadas com código** (ex.: `BRTK-42`), compartilhado entre os pais. Nada de partida com desconhecidos.
- **Sem chat livre.** Só reações prontas (emojis, "Boa!", "Quase!").
- **Só o nome do personagem**, nunca nome completo, foto, idade ou escola. Uma resposta errada digitada casa a casa não é repassada aos outros, porque seria um canal de texto livre.
- Coletar o mínimo de dados. Dados de crianças exigem consentimento dos pais (LGPD, art. 14). Se houver conta, ela é do responsável.
- Ranking por grupo de amigos/sala por padrão; ranking público só com apelidos e revisão.

## Roteiro

1. **V1:** Painel com roleta, 3 níveis, 2–4 jogadores locais, competitivo + cooperativo, navegação por controle, lógica pura em `src/logica/`.
2. Teste com crianças reais e ajuste de regras e pontuação.
3. Personagens SVG e tela de seleção. **(feito)**
4. Áudio (jingles + trilha de tema). **(feito: efeitos, jingles, volumes e trilhas; falta o ouvido do Saulo)**
5. Deploy em 3palavras.devsaulo.com.br e PWA **(feitos)**; falta o teste na TV real pelo domínio.
6. **Online:** backend Node + Socket.IO, salas privadas com código. **(no ar no competitivo; falta o teste com aparelhos reais e o cooperativo)**
7. **Ranking** entre amigos (SQLite), reaproveitando o mesmo backend.
8. Mais conteúdo no banco de painéis.
