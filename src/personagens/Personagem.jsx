import BorisBorracha from './BorisBorracha.jsx';
import CapitaoTil from './CapitaoTil.jsx';
import GalinhaCedilha from './GalinhaCedilha.jsx';
import LalaLapis from './LalaLapis.jsx';
import SapoSoletra from './SapoSoletra.jsx';
import TitoTatu from './TitoTatu.jsx';
import VoVirgula from './VoVirgula.jsx';
import ZucaZebra from './ZucaZebra.jsx';
import './Personagem.css';

const FIGURAS = {
  lala: LalaLapis,
  boris: BorisBorracha,
  til: CapitaoTil,
  cedilha: GalinhaCedilha,
  tito: TitoTatu,
  virgula: VoVirgula,
  zuca: ZucaZebra,
  sapo: SapoSoletra,
};

export default function Personagem({ personagem, expressao = 'normal' }) {
  const Figura = FIGURAS[personagem.id];
  return (
    <svg className={`personagem personagem-${expressao}`} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="50" fill={personagem.cor} />
      <Figura expressao={expressao} />
    </svg>
  );
}
