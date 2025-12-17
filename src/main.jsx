import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { UserProvider } from './context/UserContext';
import { clearTasks } from './firebase/seedData';

// Expose clearTasks to browser console for manual data cleanup
if (typeof window !== 'undefined') {
  window.clearTasks = clearTasks;
}

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
  </StrictMode>
);
