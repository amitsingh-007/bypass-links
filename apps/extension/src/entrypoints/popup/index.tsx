// !NOTE: maintain below order of css
// import '@mantine/core/styles.css';
import 'mantine-contextmenu/styles.css';
import { mantineTheme } from '@bypass/shared';
import { MantineProvider } from '@mantine/core';
import { ContextMenuProvider } from 'mantine-contextmenu';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AsyncFontLoader from './components/AsyncFontLoader';
import Global from './components/Global';
import PopupRoutes from './components/PopupRoutes';
import DynamicProvider from './provider/DynamicProvider';

function App() {
  return (
    <StrictMode>
      <MantineProvider defaultColorScheme="dark" theme={mantineTheme}>
        <ContextMenuProvider shadow="md" borderRadius="md">
          <DynamicProvider>
            <PopupRoutes />
            <Global />
            <AsyncFontLoader />
          </DynamicProvider>
        </ContextMenuProvider>
      </MantineProvider>
    </StrictMode>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
