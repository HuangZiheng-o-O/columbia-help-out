import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { UserProvider } from './context/UserContext';
import './index.css';

// Auto-seed initial data if database is empty
import { autoSeedIfEmpty } from './firebase/seedData';

// Run auto-seed in background (non-blocking)
autoSeedIfEmpty().catch(console.error);

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container #root not found');
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </StrictMode>,
);
