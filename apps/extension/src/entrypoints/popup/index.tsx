import '@bypass/ui/styles/globals.css';
import { TooltipProvider } from '@bypass/ui';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SWRConfig } from 'swr';

import { extSwrConfig } from '@/swr/config';

import './fonts.css';
import './layout.css';
import Global from './components/Global';
import PopupRoutes from './components/PopupRoutes';
import DynamicProvider from './provider/DynamicProvider';

function App() {
  return (
    <StrictMode>
      <SWRConfig value={extSwrConfig}>
        <TooltipProvider>
          <DynamicProvider>
            <PopupRoutes />
            <Global />
          </DynamicProvider>
        </TooltipProvider>
      </SWRConfig>
    </StrictMode>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
