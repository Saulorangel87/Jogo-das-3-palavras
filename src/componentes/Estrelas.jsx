export default function Estrelas({ quantidade, maximo = 3 }) {
  const texto = '★'.repeat(quantidade) + '☆'.repeat(maximo - quantidade);
  return <span aria-label={`${quantidade} de ${maximo} estrelas`}>{texto}</span>;
}
