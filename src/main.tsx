import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/global.css';
import App from '@/App';
import { Toaster } from '@/components/ui/toaster';
import 'react-day-picker/style.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster />
  </StrictMode>
);
