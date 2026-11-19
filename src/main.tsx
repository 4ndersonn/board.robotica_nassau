import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@core/styles/tokens.css';
import '@core/styles/reset.css';
import '@core/styles/typography.css';

import { App } from '@app/App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Elemento #root não encontrado no DOM.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
