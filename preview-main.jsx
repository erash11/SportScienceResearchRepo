import { createRoot } from 'react-dom/client';
import FootballResearchLibrary from './football-research-library.jsx';

// Mock window.storage using localStorage so the app runs locally
window.storage = {
  get: async (key) => ({ value: localStorage.getItem(key) }),
  set: async (key, value) => { localStorage.setItem(key, value); }
};

createRoot(document.getElementById('root')).render(<FootballResearchLibrary />);
