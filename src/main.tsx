import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupFetchInterceptor } from './lib/apiInterceptor.ts';

// Initialize transparent auth and security interceptor for all API communication
try {
  setupFetchInterceptor();
} catch (e) {
  console.warn("Fetch interceptor init:", e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

