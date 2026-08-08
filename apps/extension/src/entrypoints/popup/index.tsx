import '@bypass/ui/styles/globals.css';
import { swrConfig } from '@bypass/shared';
import { TooltipProvider } from '@bypass/ui';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SWRConfig } from 'swr';

import './fonts.css';
import './layout.css';
import Global from './components/Global';
import PopupRoutes from './components/PopupRoutes';
import DynamicProvider from './provider/DynamicProvider';

function App() {
  return (
    <StrictMode>
      <SWRConfig value={swrConfig}>
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
