import '@bypass/ui/styles/globals.css';
import { TooltipProvider } from '@bypass/ui';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SWRConfig } from 'swr';

import { firebaseAuthReady } from '@/store/firebase/useFirebaseStore';
import { extSwrConfig } from '@/swr/config';

import './fonts.css';
import './layout.css';
import Global from './components/Global';
import LoadingOverlay from './components/LoadingOverlay';
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

if (browser.extension.getViews({ type: 'popup' }).includes(window)) {
  document.documentElement.classList.add('popup');
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<LoadingOverlay />);
  void firebaseAuthReady.then(
    () => root.render(<App />),
    (error: unknown) => {
      console.error('Could not restore Firebase session', error);
      root.render(
        <p role="alert">
          Could not restore your session. Reopen the popup to retry.
        </p>
      );
    }
  );
}
