import { mantineTheme } from '@bypass/shared';
import { MantineProvider } from '@mantine/core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Global from './components/Global';
import PopupRoutes from './components/PopupRoutes';
import Logging from './error';
import DynamicProvider from './provider/DynamicProvider';

Logging.logErrors();

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <BrowserRouter>
        <MantineProvider withGlobalStyles withNormalizeCSS theme={mantineTheme}>
          <DynamicProvider>
            <PopupRoutes />
            <Global />
          </DynamicProvider>
        </MantineProvider>
      </BrowserRouter>
    </StrictMode>
  );
}
