import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { RetroConfirmProvider } from './components/PolishedUI.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RetroConfirmProvider>
      <App />
    </RetroConfirmProvider>
  </StrictMode>,
);
