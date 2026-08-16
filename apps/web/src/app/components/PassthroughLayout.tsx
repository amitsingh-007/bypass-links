import { type ReactNode } from 'react';

/** The panels are client components, so their metadata needs a layout file. */
const PassthroughLayout = ({ children }: { children: ReactNode }) => children;

export default PassthroughLayout;
