import './Avatar.css';

export default function Avatar({ personagem }) {
  return (
    <span className="avatar" style={{ backgroundColor: personagem.cor }} aria-hidden="true">
      {personagem.nome.charAt(0)}
    </span>
  );
}
