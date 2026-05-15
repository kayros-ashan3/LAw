import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safeguard for environments where window.fetch is a getter-only property
if (typeof window !== 'undefined') {
  const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
  if (descriptor && !descriptor.writable && !descriptor.configurable && descriptor.get) {
    console.warn('NIA CORE: window.fetch is a read-only property in this environment. Safeguarding...');
    // We try to prevent libraries from crashing on assignment by providing a non-crashing target if possible
    // but assignment to a non-writable property will still throw in strict mode.
    // However, some libraries check for 'fetch' in 'global' first.
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
