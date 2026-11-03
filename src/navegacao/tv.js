// Reconhece navegador de TV. LG se identifica como Web0S ou NetCast; Samsung, como Tizen.
export function pareceTV(agente) {
  return /Web0S|NetCast|Tizen|SmartTV|SMART-TV|HbbTV/i.test(agente || '');
}
