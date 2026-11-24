import React from 'react';
import ReactDOM from 'react-dom/client';

// Self-hosted via Fontsource: no Google Fonts request at runtime, licence files
// shipped with the packages. Bengali is a per-glyph fallback (see _base.scss),
// so its file is only downloaded when Bangla text actually appears.
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/instrument-sans';
import '@fontsource-variable/noto-sans-bengali';

import App from './App.jsx';
import { AuthProvider } from './context/authContext.jsx';
import './scss/style.scss';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
