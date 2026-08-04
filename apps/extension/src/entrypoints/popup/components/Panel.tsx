import { type PropsWithChildren } from 'react';

import { MAX_PANEL_SIZE } from '@/constants';

function Panel({ children }: PropsWithChildren) {
  return (
    <div
      className="relative flex flex-col"
      style={{ width: MAX_PANEL_SIZE.WIDTH, height: MAX_PANEL_SIZE.HEIGHT }}
    >
      {children}
    </div>
  );
}

export default Panel;
