import { createRoot } from 'react-dom/client';
// Vem antes do App para o CSS de cada tela poder sobrescrever a base.
import './estilos.css';
import App from './App.jsx';
import { registrarServiceWorker } from './pwa/registrar.js';

createRoot(document.getElementById('root')).render(<App />);

if (import.meta.env.PROD) registrarServiceWorker();
