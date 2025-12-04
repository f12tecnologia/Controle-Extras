import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider as SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SupabaseAuthProvider>
      <App />
      <Toaster />
    </SupabaseAuthProvider>
  </React.StrictMode>
);