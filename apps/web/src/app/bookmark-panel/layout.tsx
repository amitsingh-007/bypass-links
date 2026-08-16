import { type ReactNode } from 'react';

import { createNoindexMetadata } from '@app/constants/metadata';

export const metadata = createNoindexMetadata('Bookmarks Panel');

const Layout = ({ children }: Readonly<{ children: ReactNode }>) => children;

export default Layout;
