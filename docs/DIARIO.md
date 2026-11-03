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

## 2026-11-02 — Etapa 7: regras e banco de painéis

**O que mudou:**

- `src/logica/jogo.js`: roleta, letras, resolver, pontos e estrelas.
- `src/logica/texto.js`: comparação de letras, em que acentos e cedilha contam como a letra base.
- `src/logica/rodada.js`: sorteio dos 3 painéis, do teclado e das opções.
- `src/data/palavras.json`: 3 níveis, com palavras e frases escritas para o jogo (na etapa 14 virou um arquivo por nível).

**Por quê:** a regra continua separada da interface. A ação `GIRAR` recebe o sorteio de fora, para o servidor do modo online poder decidir o resultado.

## 2026-11-02 — Etapa 8: telas do Painel

**O que mudou:**

- Componentes novos: `Painel`, `Teclado` e `Roleta` (SVG, sem biblioteca).
- A tela de Jogo foi refeita, e a Configuração ganhou a escolha de nível.
- O bônus de resolver subiu de 5 para 20 pontos por casa fechada.

**Por quê do bônus:** jogando, uma letra rendeu 150 pontos, e resolver pagava quase nada. Com 20 por casa, perto da média da roleta (24), resolver cedo passa a valer a pena.

**Verificado no Chrome:**

- 42 testes passando e build de produção gerado.
- Só com teclado, em tela grande: configuração, giro (o ponteiro parou no valor sorteado), letra certa com acento (A abriu o Ã) e abertura do resolver.
- Cooperativo completo até 9 estrelas, com a vez passando a cada jogada, por cliques em um quadro de 360x640.
- Largura sem estouro em 360x640. O competitivo com 4 jogadores no avançado rola 156px até o teclado.

**Ainda não verificado:** competitivo completo até o resultado na tela, animação da roleta em TV ou navegador antigo, e toque em celular de verdade.

**Para observar no teste com crianças:**

- No competitivo, quem acerta continua jogando, então um adulto pode emendar várias letras.
- Valores da roleta e multiplicador podem gerar placares altos demais.

## 2026-11-02 — Etapa 9: o jogo cabe na altura da tela

**O que mudou:** em paisagem, o tamanho da interface agora acompanha a altura da tela, e a roleta e o teclado ficam sempre lado a lado.

**Por quê:** o Saulo viu a parte de baixo cortada. Havia duas causas: a janela do Chrome tinha sido redimensionada no teste para um tamanho maior que a tela dele, e o jogo realmente passava da altura em 1366x768 e 1280x720. Em 1920x1080, o teclado descia para outra linha.

**Verificado no Chrome, medindo em quadros de cada tamanho:** sem rolagem em 1920x1080, 1745x730, 1366x768 e 1280x720, no início do painel, após uma jogada e no resolver. O cooperativo foi medido só em 1745x730. Em 360x640 o jogo continua rolando até 181px, e o foco acompanha.

## 2026-11-02 — Etapa 10: resolver sem opções nos níveis maiores

**O que mudou:** no intermediário e no avançado, resolver agora é preencher as casas fechadas pelo teclado de botões. O iniciante continua com 3 opções escritas.

**Por quê:** o Saulo testou e achou a resposta óbvia demais com as opções na tela. Montar com peças, como previsto antes, teria o mesmo problema, porque as peças mostrariam as letras que faltam.

**Detalhes:**

- Letras já usadas ficam desligadas no teclado, porque não podem estar nas casas fechadas.
- Acentos entram sozinhos: digitar C e A resolve LIÇÃO.
- A tecla Voltar apaga a última letra e, sem letras digitadas, fecha o resolver.
- Ao completar as casas, o foco vai para Confirmar.

**Verificado no Chrome:**

- 47 testes passando e build gerado.
- Só com teclado: abrir o resolver, digitar, apagar, confirmar uma resposta errada (a vez passou).
- Por cliques: resposta certa, 3 frases com acento até 9 estrelas e iniciante ainda com 3 opções.
- Em 1745x730 o preenchimento cabe sem rolar. Em 360x640 a largura cabe e a tela rola até 796px.

**Ainda não verificado:** preencher frases longas com o controle remoto real, que pode ficar cansativo.

## 2026-11-02 — Etapa 11: arte dos personagens

**O que mudou:** os 8 personagens agora são SVGs originais em `src/personagens/`, cada um em seu arquivo, com 4 expressões feitas por um `Rosto.jsx` compartilhado.

**Por quê:** é o passo 3 do roteiro. Sem bibliotecas nem imagens externas, o peso do jogo quase não muda, e o desenho funciona em navegador antigo. O nome de cada um virou parte do desenho: a Vó Vírgula tem forma de vírgula, o Capitão Til tem bigode em forma de til e a Galinha Cedilha tem a cauda da cedilha.

## 2026-11-02 — Etapa 12: personagens no jogo

**O que mudou:** os personagens substituem os círculos com a inicial na seleção, no placar e no resultado. Quem tem a vez fica pensando, quem acerta comemora e quem erra faz cara de "quase". Na seleção, o personagem em foco pula.

**Por quê:** é a segunda parte do passo 3 do roteiro. A escolha da expressão só lê o estado do jogo, em `src/personagens/expressao.js`, e nenhuma regra foi para os componentes. A única mudança nas regras foi registrar quem fez a última jogada.

**Verificado no Chrome:**

- 53 testes passando e build gerado.
- Só com teclado: seleção e início da partida com 3 jogadores.
- Por cliques: partida completa com 4 jogadores nos dois modos até o resultado, incluindo o competitivo, que faltava.
- Sem rolagem em 1920x1080, 1745x730 e 1280x720. Em 360x640 a largura cabe, e a seleção e o jogo rolam pouco.

**Ainda não verificado:** animações em TV ou navegador antigo.

## 2026-11-03 — Etapa 13: áudio (efeitos, jingles e volume)

**O que mudou:** novo módulo `src/audio/`, feito só com a Web Audio API, sem biblioteca.

- **Efeitos:** giro da roleta, letra certa e errada, resolver errado, painel resolvido e fim da partida.
- **Jingles:** um por personagem, no timbre do seu instrumento (xilofone, tuba, sanfona, clarinete, fagote, piano, bateria e kazoo). O da Vó Vírgula tem uma pausa no meio.
- **Painel de som:** botão "Som" com volume de 0 a 100% e opção de silenciar, a pedido do Saulo. Mudar o volume toca um som de exemplo.
- **Preferências:** ficam salvas em `localStorage`.

**Decisões:**

- Web Audio direto, sem Tone.js: o `CLAUDE.md` pede para evitar dependências sem necessidade, e para efeitos e jingles ele basta.
- O som só liga no primeiro toque do jogador, por exigência dos navegadores.
- No competitivo, quem resolve ouve o jingle do próprio personagem. No cooperativo, toca uma fanfarra da equipe.
- Por enquanto há um único volume, que controla os efeitos. O da música entra junto com a trilha.

**Defeito encontrado e corrigido no teste:** a navegação por setas da etapa 4 escolhia o botão mais próximo em linha reta e podia descer em vez de ir para o lado, quando um botão ficava quase em cima de outro. No painel de som, a seta esquerda no "+" ia para "Fechar". Agora quem está alinhado na mesma linha ou coluna vence.

**Verificado no Chrome:**

- 76 testes passando e build gerado.
- Os 14 sons foram renderizados fora do tempo real: nenhum silencioso, nenhum valor inválido e nenhum estouro (pico máximo 0,52, o limite é 1).
- O áudio fica inativo até o primeiro toque e passa a funcionar com um Enter.
- Uma partida competitiva tocou cada som esperado. Abrir o resolver ficou em silêncio, e o mudo zerou todos os sons.
- Só com teclado: abrir o painel, subir e descer o volume, silenciar e fechar com Voltar. Também dentro da partida, onde Voltar fecha só o painel de som. O painel cabe em 360x640.

**Não verificado:** como os sons realmente **soam**. Não consigo ouvir, então o equilíbrio de volume entre os sons e a qualidade dos timbres dependem do ouvido do Saulo. Também falta testar em TV ou navegador antigo.

## 2026-11-03 — Etapa 14: mais de mil itens por nível

**O que mudou:** o banco saiu de 43 itens para mais de 3 mil, a pedido do Saulo ("pelo menos mil palavras para cada nível").

- **Iniciante:** 1080 palavras de 2 a 10 letras, em 39 temas (fazenda, casa, corpo, comida, escola, profissões e outros).
- **Intermediário:** 1035 palavras de 5 a 12 letras, em 32 temas (frutas, países, capitais, ciência, tecnologia, verbos e outros).
- **Avançado:** 1018 frases de 2 a 6 palavras, em 19 temas (ditados populares, receitas, escola, natureza, cidade, esportes, festas e outros).
- O `palavras.json` único foi dividido em `iniciante.json`, `intermediario.json` e `avancado.json`. `carregarPalavras(nivel)` carrega cada um só quando pedido (`import()` dinâmico) e guarda em cache. O build gera um arquivo por nível, de 50 a 60 KB cada.

**Decisões:**

- **O iniciante deixou de ser só "2 sílabas".** Mil palavras simples de 2 sílabas que dão para ilustrar não existem. Agora são palavras curtas, de 2 a 10 letras, e o `CLAUDE.md` foi ajustado.
- **Nem tudo tem emoji.** Muitos itens usam uma dica escrita curta (por exemplo, "Vem da vaca"). Emoji só de Unicode até a versão 9, porque TV e navegador antigos não desenham os novos. Os que eram novos demais (🪁, 🧃, 🥥, 🦒, 🦓, 🦷) foram trocados por dica escrita.
- Os textos foram escritos em listas compactas (`TEXTO|dica`, por tema) e convertidos por um script que descartou o que não servia: repetidos, hífen, palavra fora do tamanho do nível, emoji novo e dica que entrega a resposta. Cerca de 20% do que escrevi caiu nesse filtro.
- Os testes passaram a conferir tudo isso: mínimo de 1000, repetição, tamanhos por nível, emoji antigo e dica sem a resposta (85 testes).

**Verificado:** testes e build (inclusive o pacote antigo para TV) passam. No Chrome, os 3 níveis carregam com as contagens certas e uma partida avançada abre em 360x640 com a frase quebrando em linhas.

**Não verificado:** a revisão do conteúdo é minha, sem dicionário de português na máquina. Pode haver dica fraca, ambígua ou palavra que não combine com o nível. Vale o Saulo (ou as crianças) jogar e apontar o que estranhar. Também falta ver as frases mais longas na TV.

## 2026-11-03 — Etapa 15: sem palavras repetidas entre partidas

**O que mudou:** o jogo lembra o que já foi jogado em cada nível e não repete.

- `montarRodada` recebe o histórico de fora (`jogadas` e `ultimoTema`), para `src/logica/` continuar puro, e devolve `reinicio` quando não sobra tema com 3 itens novos. `registrarRodada` calcula o histórico novo.
- `src/data/historico.js` guarda o histórico por nível no `localStorage`, com try/catch. Sem armazenamento, o jogo só deixa de lembrar.
- O tema da partida anterior também é evitado, se houver outro.
- Quando o nível esgota, o histórico recomeça sozinho. Sobras de 1 ou 2 itens num tema só voltam depois desse reinício.

**Verificado:** 89 testes, incluindo 100 partidas seguidas em cada nível do banco real sem nenhuma palavra repetida.

## 2026-11-03 — Etapa 16: papéis de parede

**O que mudou:** cada tela ganhou um papel de parede próprio, desenhado em SVG por código (`src/fundos/Fundo.jsx`). Nenhuma imagem externa, filtro ou animação, para rodar em TV antiga.

- **Início:** céu noturno com estrelas, peças de letra espalhadas, pilha de livros, colinas e um lápis. A área do título fica livre de peças.
- **Configuração:** folha de caderno, com pautas, margem vermelha, espirais, régua, borracha e lápis.
- **Jogo:** versão calma, para não atrapalhar a leitura, com trama discreta de peças e um brilho no alto: amarelo no competitivo e verde no cooperativo.
- **Resultado:** festa, com bandeirinhas, confete e raios de luz. O miolo da tela, onde fica o texto, tem menos confete.

**Decisões:** as peças usam sorteio com semente fixa, então o desenho é sempre o mesmo. Ficam perto do centro mais apagadas. O `Fundo` é `position: fixed` atrás de tudo, sem foco nem toque, e cobre a tela de 360x640 até 1920x1080 (`slice`).

**Verificado no Chrome:** início, configuração, jogo e resultado (este por uma página de prévia descartada), e o texto continua legível. 89 testes e build passam.

**Não verificado:** como o SVG se comporta na TV real e no celular de verdade.

## 2026-11-03 — Etapa 17: animação ao resolver a palavra

**O que mudou:** quando o painel é resolvido, as casas dão um pulinho em onda, da primeira à última, e o quadro faz um brilho amarelo rápido. As casas terminam verdes, o que também marca o painel como concluído.

- Só CSS (`transform`, `background` e `box-shadow` em `@keyframes`), sem biblioteca, compatível com o Chromium 57 das TVs. O atraso de cada casa vem de `animation-delay` calculado em `Painel.jsx`.
- O passo da onda encolhe nas frases longas (70 ms no máximo), para a onda inteira durar menos de um segundo.
- Quem pede menos movimento no sistema (`prefers-reduced-motion`) vê só as casas verdes, sem animação.

**Verificado no Chrome:** num painel resolvido, as 3 animações dispararam, os atrasos saíram escalonados (0, 70, 140 ms…), e no fim as casas ficaram verdes e sem deslocamento. 89 testes e build passam.

**Não verificado:** a fluidez na TV real e em celular fraco.

## 2026-11-03 — Etapa 18: comemoração mais festiva, com som

**O que mudou:** resolver um painel agora tem uma comemoração em três tempos, e o som acompanha cada um.

1. **Onda:** as casas pulam uma a uma (como na etapa 17). No som, um tilintar de sino sobe uma escala pentatônica, uma nota por casa.
2. **Estouro:** depois da última casa, 34 peças de confete e estrelas saem do centro do painel (`Festa.jsx`) e o quadro brilha. No som, entram um estalo, um chiado de confete e uma chuva de brilhos agudos.
3. **Final:** no cooperativo, um acorde brilhante fecha a comemoração. No competitivo, o jingle do personagem que resolveu começa no estouro, e não mais no começo, para cair junto com o confete.

**Como o som acompanha a imagem:** os tempos moram em `src/componentes/celebracao.js` (passo da onda, atraso do estouro, espera pelo som da letra) e são usados pelo `Painel`, pela `Festa` e pelo `useEfeitosDoJogo`. Se uma letra resolveu o painel, tudo espera 450 ms para o som da letra terminar. O efeito `resolvido` virou `celebracao` e recebe o número de casas e o passo da onda.

**Cuidados:** só CSS (variáveis e `calc`, que o Chromium 57 aceita) e Web Audio, sem biblioteca. As peças usam sorteio de semente fixa. Quem pede menos movimento no sistema não vê o confete.

**Verificado no Chrome:** 94 testes e build passam. O efeito foi renderizado fora do tempo real nos casos de 5, 14 e 30 casas: sem silêncio, sem valor inválido e com pico entre 0,37 e 0,65 (o `fim` fica em 0,56; o limite é 1). No jogo, as 34 peças animaram e o quadro parado no meio do voo mostrou o confete e as estrelas espalhados.

**Não verificado:** como o som realmente soa (o Claude não ouve): o volume em relação aos outros sons e se o tilintar combina com a onda dependem do ouvido do Saulo. Também falta a fluidez na TV real.

## 2026-11-03 — Teste na TV real

**Resultado (relato do Saulo):** numa LG de 2024 (webOS 24), o jogo abriu pelo navegador da TV, em modo de desenvolvimento, pela rede local (`http://<IP do computador>:5180`). Tudo funcionou direito (telas, navegação, som). As animações travam um pouco, sem atrapalhar o jogo.

**Possíveis melhorias, se incomodar:** as animações que mais custam são o brilho do quadro (`box-shadow`) e a troca de cor das casas (`background`), que repintam a tela. Dá para trocá-las por `opacity` e `transform`, que a TV desenha com a placa de vídeo. O teste foi no modo de desenvolvimento; o build final tende a rodar mais leve.

**Ainda não verificado:** TV mais antiga (webOS 4 ou anterior), Samsung (Tizen), o build legado e o controle de seta comum (o teste foi com o controle da TV).

## 2026-11-03 — Etapa 19: música de fundo e volume da música

**O que mudou:** o jogo agora tem trilha em loop, com volume próprio no painel de som (fecha o passo 4 do roteiro).

- **Seis trilhas originais** em `src/audio/musica.js`, escritas como dados (escala, progressão de acordes, melodia, baixo, arpejo e bateria, 8 compassos de 4/4, de 17 a 26 segundos cada): `abertura`, `alegre`, `calma`, `aventura`, `misterio` e `festa`. Tocam com os mesmos instrumentos dos personagens (xilofone na melodia, piano no arpejo, tuba no baixo, bateria leve).
- **Qual toca:** início e configuração usam a `abertura`. No jogo, o **tema** da partida escolhe a faixa: temas de clima óbvio (Festa, Fantasia, Praia...) têm a sua, e os outros são distribuídos pelo nome, sempre na mesma faixa. No resultado a música para, para o som de fim aparecer. Não existe uma trilha feita para cada um dos cerca de 90 temas.
- **Motor:** agenda os compassos com antecedência de 1,5 s (o relógio do áudio é preciso, o do navegador não), troca de faixa com fade, não reinicia se a mesma faixa for pedida e pausa quando a aba fica escondida. A música pedida antes do primeiro toque começa quando o som é liberado.
- **Painel de som:** duas linhas, "Efeitos" e "Música", cada uma com − e +. O silenciar vale para as duas. Cabe em 360x640 e a navegação por setas passa de uma linha à outra.
- **Mixagem:** medi as trilhas e elas tinham a mesma força dos efeitos, o que seria alto demais para fundo. Com o volume no máximo, a música fica na metade dos efeitos.

**Verificado:** 116 testes e build. As seis trilhas foram renderizadas fora do tempo real: sem valores inválidos, picos de 0,26 a 0,37 e sem trechos mudos (exceto 1 segundo na `misterio`, que é esparsa de propósito). No Chrome: antes do toque não há som, depois do primeiro clique o áudio roda, a faixa muda com a tela (abertura, depois a do tema, depois abertura de novo), e o painel de som muda o volume da música sem mexer nos efeitos.

**Não verificado:** como a música soa. O Claude não ouve, então melodia, andamento, cansaço do loop e volume dependem do ouvido do Saulo. Se alguma faixa irritar, é só trocar os dados ou o mapa de temas. Também falta ver se a TV aguenta a música junto com as animações (já havia um pouco de travamento).

## 2026-11-03 — Etapa 20: música nova, que acompanha o andamento do jogo

**Por quê:** o Saulo achou a música da etapa 19 "muito ruim" e pediu algo mais compatível com o jogo, que acelere conforme as palavras são descobertas. Troquei a música inteira.

**O que mudou:**

- **Andamento e camadas seguem o painel.** O jogo avisa à música quanto do painel já abriu (letras abertas ÷ letras do painel). O andamento vai do mínimo ao máximo da faixa (por exemplo, de 100 a 132 bpm na `saltitante`), subindo de poucos em poucos passos, sem trancos. As camadas entram em ordem: base (colchão macio e baixo) sempre; arpejo cheio a partir de 25%; melodia a partir de 30%; bateria a partir de 60%.
- **Cada painel recomeça um pouco mais rápido** (3% a mais que o anterior), e ao começar um painel novo o andamento desce de novo. Enquanto o painel comemora, a música abaixa para os sons de festa aparecerem, e no resultado ela para.
- **Música nova:** abertura mais quatro faixas de jogo (`saltitante`, `aventura`, `festa`, `suave`), com melodias em escala pentatônica (não "desafina" com nenhum acorde), progressões de acordes simples e timbres macios feitos para fundo (kalimba, baixo redondo, harpa, colchão), com um filtro que corta o chiado agudo. O tema da partida ainda escolhe a faixa.
- **Código:** o agendador passo a passo é puro e testável (`criarAgendador`). O motor agenda só 0,6 s à frente, para a música reagir logo ao jogo.

**Verificado:** 125 testes (andamento, camadas, reinício, volta do loop, situação do jogo → música) e build. As faixas foram renderizadas fora do tempo real numa partida simulada: sem valores inválidos, pico máximo 0,48 e volume estável (a força sobe de 0,045 para 0,068 com as camadas). No Chrome, jogando: o andamento foi de 122 para 130, 136 e 142 bpm conforme as letras abriram, e caiu no painel seguinte.

**Não verificado:** como a música soa. O Claude não ouve, e a versão anterior já tinha sido reprovada pelo ouvido do Saulo. Se ainda não agradar, o que ajuda é saber o que incomoda: o timbre, a melodia, a velocidade, o volume ou o jeito de acelerar.

## 2026-11-03 — Etapa 21: revisão do iniciante e regras num arquivo só

**Por quê:** o teste real (crianças e TV) já tinha passado e o Saulo pediu a revisão final do nível para os pequenos e o ajuste que deixa a pontuação fácil de mudar.

**O que mudou:**

- **Iniciante mais leve para 5 a 7 anos:** palavras de no máximo **8 letras** (antes 10). As 62 palavras maiores foram para o intermediário (as que já existiam lá só saíram do iniciante), e 6 itens pouco adequados foram retirados (ladrão, cadeia, zumbi, bagaço, foguetão, amarelinha). Mais de 120 dicas escritas viraram frases curtas e concretas (por exemplo, "Protetor da mata", "Dá leite e tem chifres"). Entraram 11 palavras novas para manter o mínimo: o iniciante tem 1008 itens e o intermediário 1097.
- **Intermediário:** recebeu as palavras movidas dentro dos temas que já tinha, sem criar temas pequenos.
- **Regras num lugar só:** `src/logica/regras.js` guarda fatias da roleta, pontos por casa fechada, multiplicadores dos painéis e faixas de estrelas. A lógica continua pura e o servidor online poderá reutilizar o arquivo. Mudar a pontuação agora é editar um arquivo.

**Verificado:** 128 testes (o teste do iniciante agora exige 2 a 8 letras; novo teste de consistência das regras) e build.

**Pendente:** o ouvido do Saulo nas trilhas e a próxima etapa, o deploy.

## 2026-11-03 — Etapa 22: deploy em 3palavras.devsaulo.com.br

**O que mudou:** o jogo está no ar na VPS Oracle, com HTTPS pelo Cloudflare.

- **Container:** `Dockerfile` (build do Vite em Node, depois Nginx) e `docker-compose.yml`, container `tres-palavras` em `100.67.151.30:8810`. A configuração do Nginx está em `deploy/nginx/default.conf`.
- **Cloudflare:** a VPS já usava o Cloudflare Tunnel "Server Oracle" (não o Nginx Proxy Manager, que o roteiro citava). Adicionei a rota `3palavras.devsaulo.com.br` -> `http://100.67.151.30:8810` no painel, e o CNAME no DNS foi criado junto.
- **Segurança:** o CSP precisou liberar `data:` em `script-src`, porque o plugin legado do Vite injeta scripts de detecção de recursos; sem isso o navegador caía sempre na versão legada. Depois do ajuste, o console ficou limpo.
- **Extras:** favicon em SVG (antes o navegador recebia a página do jogo no lugar do ícone) e o script `deploy/publicar.sh`, que publica o commit atual sem precisar de push.

**Verificado:** imagem testada localmente (cabeçalhos, cache, fallback), site público respondendo 200 em HTTPS com gzip, e uma partida aberta no endereço de produção sem erros no console. O container ficou `healthy`, usando cerca de 4 MB.

**Pendente:** PWA (offline) e teste na TV real pelo domínio de produção. A branch `palavras` continua sem push (o deploy usa o commit local).

## 2026-11-03 — Etapa 23: README e release 1.0.0

**O que mudou:** o projeto ganhou `README.md` (como jogar, níveis, TV, como rodar, organização do código e publicação), a versão subiu para **1.0.0** e o release foi publicado no GitHub.

- **Git:** o `main` remoto já tinha o merge do PR #1; mesclei esse merge no `main` local (o conteúdo ficou idêntico ao da `palavras`), enviei `main` e `palavras` e criei a tag `v1.0.0` em `main`. Não sobrou commit nem push pendente em nenhuma branch.
- **Release:** https://github.com/Saulorangel87/Jogo-das-3-palavras/releases/tag/v1.0.0, com notas em português.
- **Regra daqui para frente:** a cada deploy, atualizar documentos e release (registrado no CLAUDE.md).

## 2026-11-03 — Etapa 24: PWA, instalar e jogar sem internet (versão 1.1.0)

**O que mudou:**

- **Service worker feito à mão**, sem biblioteca (`src/pwa/`). Um plugin do Vite gera `dist/sw.js` no fim do build, com a lista de arquivos e uma versão calculada pelo conteúdo. Os 3 níveis ficam guardados na primeira visita.
- **Atualização:** a página tenta a rede por até 3 s, para pegar versão nova, e sem rede usa a guardada. Os arquivos com hash vêm do cache. Uma versão nova vale na visita seguinte, e o cache anterior é mantido, para uma aba aberta conseguir carregar um nível da versão dela.
- **Instalação:** manifesto e ícones em `public/`.
- **Falha corrigida:** o `Dockerfile` não copiava `public/`, e o Nginx devolvia a página do jogo para qualquer arquivo inexistente. Por isso o favicon da etapa 22 nunca chegou à produção: o teste viu 200 e não olhou o tipo. Agora arquivo inexistente é 404, e `deploy/publicar.sh` confere também o tipo do `sw.js`.
- **Nginx:** cabeçalhos de segurança em `deploy/nginx/seguranca.inc`, incluído em cada `location`.

**Verificado:** 133 testes e build. No navegador, com o servidor parado de verdade: a página recarregou e abriu uma partida no nível avançado, que ainda não tinha sido carregado, sem erros no console.

**Não verificado:** service worker no navegador da TV. Se a TV não suportar ou falhar, o jogo continua online como antes.

## 2026-11-03 — Etapa 25: auditoria de segurança e container endurecido (versão 1.1.1)

**Sem vulnerabilidade conhecida:** `npm audit` zerado, nenhum segredo encontrado no histórico (busca por padrões em todas as branches, sem ferramenta dedicada), nenhum ponto de injeção no código (`innerHTML`, `eval`), sem chamadas externas. O jogo não tem backend nem coleta dados: só guarda preferências e histórico de palavras no aparelho.

**Corrigido nesta etapa:** o container rodava como root; agora roda sem root, com disco somente leitura e sem capacidades. O `publicar.sh` usa `--pull`, porque antes a imagem base em cache nunca era atualizada. O servidor de teste aberto na rede local (porta 5180) foi parado.

**Decisões pendentes do Saulo** (mudam configuração de conta):
- GitHub: ligar alertas e atualizações do Dependabot; bloquear force-push e exclusão do `main`; restringir as Actions permitidas.
- Cloudflare: uma regra da zona troca o CSP do Nginx por `upgrade-insecure-requests`, então o CSP do jogo não chega ao navegador. Risco baixo hoje, por não haver entrada de usuário nem backend, mas importa no modo online.

**Testado:** atualização do PWA com duas versões reais: a página nova chega na visita seguinte, e o arquivo da versão antiga continua vindo do cache quando o servidor já responde 404.

**Atualização:** o Saulo aprovou os itens do GitHub. Dependabot (alertas e correções) ligado, `main` protegido contra force-push e exclusão pela regra "Proteger main", sem exigir PR, e Actions desligadas até haver um workflow. Os itens do Cloudflare continuam pendentes.

**Atualização (Cloudflare):** os três itens aplicados, valendo só para o jogo. O host entrou na lista de exclusão da regra "Cabeçalho de segurança", e a CSP do Nginx passou a chegar ao navegador. A nova regra "3 Palavras - sem Web Analytics" desliga a medição só aqui, porque o Web Analytics vale para a zona inteira. A nova regra "3 Palavras - revalidar sw e manifesto" cobre só esses dois arquivos.

**Verificado:** cabeçalhos dos outros 13 endereços comparados antes e depois, todos iguais. `devsaulo` e `cddcampos` continuam com o script de medição. O jogo abre uma partida com a CSP ativa, sem o script no HTML, com console limpo depois de baixar a página de novo.

**Observação:** um navegador que já visitou o site pode reaproveitar a cópia antiga da página, com o script, até a próxima publicação (o ETag é o mesmo). Nesse caso, a CSP bloqueia o script.

## 2026-11-03 — Etapa 26: som e menu na TV (versão 1.1.2)

**Relato do Saulo na LG:** sem som, e no menu inicial o seletor não vai para "Som"; nos menus seguintes funciona.

**Som, bug encontrado no código:** o jogo tentava liberar o áudio só no primeiro gesto e depois parava de escutar. Se esse gesto não contasse para o navegador, como pode acontecer com uma seta do controle, o áudio ficava travado até recarregar a página. A etapa 19 também passou a depender de `document.hidden`. Agora tenta a cada gesto, sem consultar `document.hidden`. Isso é a causa provável, ainda não confirmada na TV.

**Menu, não reproduzido:** em 1920x1080 com teclas de verdade, o foco vai de Jogar para Som e volta. A hipótese é que a página abre na TV sem receber o teclado, que só chega a ela depois do primeiro clique. Isso explicaria os menus seguintes funcionarem, mas não está confirmado. Acrescentei `window.focus()` ao abrir.

**Diagnóstico:** `?diag` no endereço mostra na própria TV o que o jogo recebe, para separar bug de comportamento da TV.

**Verificado:** 136 testes e build. **Não verificado:** nada disso numa TV real ainda.

**Correção de registro:** o `InvalidStateError` do console não vinha do script de medição, como eu havia escrito: ele voltou a aparecer sem o script. A causa segue desconhecida; pode ser efeito de navegar durante o teste automatizado.

## 2026-11-03 — Etapa 27: favicon e metadescrição (versão 1.1.3)

**Favicon, bug da etapa 24:** o Saulo notou o site sem ícone. No Chrome dele, o service worker tinha guardado `/favicon.svg` como `text/html`: ao instalar, pegou a cópia velha do cache do navegador, do tempo em que o Nginx devolvia a página do jogo para arquivos inexistentes. Agora ele guarda os arquivos direto do servidor (`cache: 'reload'`). Também entrou um `favicon.ico` de verdade, para navegadores sem suporte a SVG.

**SEO:** metadescrição, apontada pelo Lighthouse do Saulo.

**Diagnóstico:** `?diag` agora aparece também no jogo e no resultado.

**Verificado:** 137 testes. No Chrome, com a imagem local: arquivos guardados com o tipo certo, `.svg` e `.ico` carregam. A cópia velha em si não foi simulada; a prova final é o Chrome do Saulo depois de publicar.

## 2026-11-03 — Etapa 28: servidor do modo online

**O que mudou:** primeiro passo do online, para a filha do Saulo jogar com as colegas. Ainda não há tela nem deploy: o jogo publicado não mudou.

- **`servidor/`:** Node + Socket.IO. Salas com anfitrião, código e presença, reaproveitando `src/logica/`. Regras novas e puras: `PASSAR_VEZ` e `MARCAR_SAIDA`.
- **Segurança:** o aparelho nunca recebe a resposta antes da hora; o servidor sorteia a roleta e confere a vez; só o site do jogo conecta; limites para adivinhar código, criar salas e mandar eventos; nada é gravado.
- **Canal escondido fechado:** a resposta errada digitada casa a casa era repetida para todos, o que funcionaria como um chat livre entre crianças. Agora não é repassada.
- **Espera de quem cai na vez:** 60 segundos, em vez dos 30 do plano, porque 30 parecia pouco para crianças pequenas.

**Verificado:** 178 testes, incluindo clientes reais pela rede. Servidor real com o banco inteiro nos 3 níveis. Ao tirar de propósito a proteção que esconde a resposta, os testes falharam, como deviam.

**Limitação conhecida:** quem fica conectado sem jogar não perde a vez, e a partida espera. Avaliar com as crianças.

**Próximo:** telas de criar, entrar e aguardar.

## 2026-11-03 — Etapa 29: modo online pronto para publicar (versão 1.2.0)

**Menu da TV, resolvido o mistério:** a foto do `?diag` na LG mostrou `Página com teclado: NÃO` e `Tecla: nenhuma ainda`. O navegador da TV fica com as teclas até a página receber um clique, e o `window.focus()` não basta. Não é bug do jogo, e não há como pedir o teclado pelo código. A tela inicial agora avisa quando reconhece TV. O som depende do mesmo clique; falta confirmar que ele sai depois disso.

**Modo online:**

- **Telas:** Jogar online, criar sala, entrar por link ou por código em botões, sala de espera com presença e convite. A partida usa a mesma `Jogo.jsx`.
- **Quedas:** faixa "Sua internet caiu", "(reconectando)" no placar, contagem de 60 segundos na própria vez. Recarregar a página volta à mesma vaga.
- **Infraestrutura:** segundo container, sem porta publicada, sem root e com disco somente leitura. O Nginx repassa `/socket.io/`. Nada muda no Cloudflare.

**Bug achado no teste:** quem recarregava sem o link do convite caía na tela inicial e perdia a partida. Corrigido.

**Verificado (local):** 185 testes. Com os dois containers e duas abas no Chrome: convite, personagem ocupado travado, presença, vez, roleta igual nas duas telas, queda com contagem, volta pela mesma vaga, painel resolvido, saída e resultado. Em 360 px não há rolagem lateral.

**Não verificado:** produção (WebSocket pelo Cloudflare), celulares de verdade em redes diferentes e tela bloqueada. A partida completa de 3 painéis pela tela só foi até o segundo painel; os 3 painéis completos estão cobertos nos testes do servidor.

## 2026-11-03 — Etapa 30: modo online no ar (versão 1.2.0)

Publicado na VPS com o segundo container. Nada mudou no Cloudflare.

**Verificado em produção:**

- **Pela rede:** o WebSocket responde `101` passando pelo Cloudflare. Conexão vinda de outro site recebe `403`. O container do servidor não tem porta publicada, roda sem root e com disco somente leitura.
- **Em duas abas do Chrome:** partida inteira no iniciante, de 3 painéis: convite, personagem ocupado travado, vez de cada um, mesma roleta nas duas telas, multiplicadores ×1, ×2 e ×3, recarregar na própria vez e voltar à mesma vaga, e resultado igual nas duas abas (620 a 200, conferido na conta). Sem erro no console e sem dados de jogadores nos logs.

**Ainda não verificado:** celulares de verdade em redes diferentes e com a tela bloqueada, e o som na TV depois do clique.

**Próximo:** partida com aparelhos reais. Depois, cooperativo online e ranking.

## 2026-11-03 — Etapa 31: ajustes depois do primeiro teste do Saulo (versão 1.2.1)

**Palavra sumindo:** nenhum temporizador a escondia. Só quem resolveu tinha o botão de seguir, e o clique dele tirava a palavra da tela de todos. Além disso, o botão nasce no lugar da opção de resposta, então um toque duplo pulava a palavra, inclusive no jogo local. Agora cada pessoa clica para seguir, e o botão ignora cliques no primeiro segundo.

**Decisão a rever com as crianças:** depois do primeiro clique, as outras têm 30 segundos, com contagem na tela. Sem isso, uma criança que largou o aparelho travaria todo mundo. Sem nenhum clique, a palavra fica na tela sem prazo.

**Vitória sem motivo:** o resultado não dizia que a outra pessoa tinha saído. Agora diz, por exemplo, "Lalá Lápis saiu da partida, por isso ela terminou aqui." Quem saiu aparece com "(saiu)" no fim do placar e não vence mais, mesmo com mais pontos. Antes, quem saía podia ganhar.

**Verificado (local):** 197 testes. Em duas abas do Chrome: toque duplo ignorado, palavra na tela do outro depois do clique de quem resolveu, os dois cliques, avanço sozinho em 30 s, saída no último painel com 400 a 160 e resultado explicando.

**Não verificado:** a proteção contra toque duplo no jogo local (é o mesmo botão, mas só foi testada online) e a saída no meio de um painel pela tela (coberta nos testes). Produção e celular real, até publicar.

