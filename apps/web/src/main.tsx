import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { EmergencySessionProvider, ResponderUiProvider } from './state';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root was not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <EmergencySessionProvider>
      <ResponderUiProvider>
        <App />
      </ResponderUiProvider>
    </EmergencySessionProvider>
  </StrictMode>,
);
