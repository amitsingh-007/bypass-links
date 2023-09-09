import { mantineTheme } from '@bypass/shared';
import { MantineProvider } from '@mantine/core';
import { ContextMenuProvider } from 'mantine-contextmenu';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Global from './components/Global';
import PopupRoutes from './components/PopupRoutes';
import Logging from './logging';
import DynamicProvider from './provider/DynamicProvider';

Logging.init();

const App = () => {
  return (
    <StrictMode>
      <BrowserRouter>
        <MantineProvider withGlobalStyles withNormalizeCSS theme={mantineTheme}>
          <ContextMenuProvider shadow="md" borderRadius="md">
            <DynamicProvider>
              <PopupRoutes />
              <Global />
            </DynamicProvider>
          </ContextMenuProvider>
        </MantineProvider>
      </BrowserRouter>
    </StrictMode>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
