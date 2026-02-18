// !NOTE: maintain below order of css
import '@bypass/ui/styles/globals.css';
import { TooltipProvider } from '@bypass/ui';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AsyncFontLoader from './components/AsyncFontLoader';
import Global from './components/Global';
import PopupRoutes from './components/PopupRoutes';
import DynamicProvider from './provider/DynamicProvider';

function App() {
  return (
    <StrictMode>
      <TooltipProvider>
        <DynamicProvider>
          <PopupRoutes />
          <Global />
          <AsyncFontLoader />
        </DynamicProvider>
      </TooltipProvider>
    </StrictMode>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
