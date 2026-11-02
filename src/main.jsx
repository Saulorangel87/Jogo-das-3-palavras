import { createRoot } from 'react-dom/client';
// Vem antes do App para o CSS de cada tela poder sobrescrever a base.
import './estilos.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
