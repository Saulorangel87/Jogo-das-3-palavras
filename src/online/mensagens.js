// Erros do servidor em palavras que uma criança e os pais entendem.
const MENSAGENS = {
  'sala-nao-encontrada': 'Não achamos essa sala. Confira o código com quem convidou.',
  'partida-comecou': 'Essa partida já começou. Peça um convite para a próxima.',
  'sala-cheia': 'Essa sala já está cheia.',
  'personagem-ocupado': 'Alguém acabou de escolher esse personagem. Escolha outro.',
  'muitas-tentativas': 'Muitas tentativas. Espere um minuto e tente de novo.',
  'muitas-salas': 'Muitas salas criadas. Espere um minuto e tente de novo.',
  'servidor-cheio': 'O jogo está cheio agora. Tente de novo daqui a pouco.',
  'faltam-jogadores': 'Espere mais alguém entrar para começar.',
  'vaga-perdida': 'Sua vaga nessa sala terminou. Peça um novo convite.',
  'sem-resposta': 'Sem conexão com o jogo. Confira a internet e tente de novo.',
};

export function mensagemDeErro(codigo) {
  return MENSAGENS[codigo] || 'Algo deu errado. Tente de novo.';
}

// Explica no resultado por que a partida mudou: sem isso, a vitória parece sem motivo.
export function textoDeQuemSaiu(jogadores, encerrada) {
  const nomes = jogadores.filter((j) => j.saiu).map((j) => j.nome);
  if (nomes.length === 0) return null;
  const lista = nomes.length === 1 ? nomes[0] : `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;
  const uma = nomes.length === 1;
  if (!encerrada) return `${lista} ${uma ? 'saiu' : 'saíram'} da partida.`;
  return uma
    ? `${lista}, seu adversário, saiu da partida. Quem ficou venceu!`
    : `${lista}, seus adversários, saíram da partida. Quem ficou venceu!`;
}

const FORMATO_DO_CODIGO = /^[BCDFGHJKLMNPRSTVZ]{4}-\d{2}$/;
export const LETRAS_DO_CODIGO = 'BCDFGHJKLMNPRSTVZ'.split('');
export const DIGITOS_DO_CODIGO = '0123456789'.split('');

// Código vindo do link do convite. Qualquer outra coisa é ignorada.
export function codigoDoEndereco(busca) {
  const codigo = (new URLSearchParams(busca).get('sala') || '').toUpperCase();
  return FORMATO_DO_CODIGO.test(codigo) ? codigo : null;
}

export function linkDoConvite(origem, codigo) {
  return `${origem}/?sala=${codigo}`;
}

// As 4 letras vêm antes dos 2 números; o traço entra sozinho.
export function teclasDoCodigo(digitado) {
  return digitado.length < 4 ? LETRAS_DO_CODIGO : DIGITOS_DO_CODIGO;
}

export function formatarCodigo(digitado) {
  return digitado.length > 4 ? `${digitado.slice(0, 4)}-${digitado.slice(4)}` : digitado;
}
