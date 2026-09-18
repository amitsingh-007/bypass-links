import { type PropsWithChildren } from 'react';

import { MAX_PANEL_SIZE } from '@/constants';

function Panel({ children }: PropsWithChildren) {
  return (
    <div
      className="relative flex h-(--panel-height) w-(--panel-width) flex-col"
      style={{
        '--panel-height': `${MAX_PANEL_SIZE.HEIGHT}px`,
        '--panel-width': `${MAX_PANEL_SIZE.WIDTH}px`,
      }}
    >
      {children}
    </div>
  );
}

export default Panel;
