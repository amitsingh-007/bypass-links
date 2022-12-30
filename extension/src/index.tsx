import { mantineTheme } from '@bypass/shared/constants/theme';
import { MantineProvider } from '@mantine/core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Global from './components/Global';
import PopupRoutes from './components/PopupRoutes';
import DynamicProvider from './provider/DynamicProvider';

const container = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
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
