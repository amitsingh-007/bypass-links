import { type Metadata } from 'next';
import { type ReactNode } from 'react';

const NOINDEX_ROBOTS: Metadata['robots'] = {
  follow: false,
  index: false,
};

export const createNoindexMetadata = (title: string): Metadata => ({
  title,
  robots: NOINDEX_ROBOTS,
});

/** The panels are client components, so their metadata needs a layout file. */
export const PassthroughLayout = ({ children }: { children: ReactNode }) =>
  children;
