import { createContext } from 'react';

/**
 * Split out of DynamicContext: the query string changes on every navigation,
 * and rebuilding the whole dynamic context for it re-rendered every consumer
 * (bookmark rows, favicons, headers) plus invalidated the storage identity
 * those hooks depend on. Only the persons grid reads this.
 *
 * Platform-neutral by necessity — shared components cannot import Wouter's
 * useSearch or Next's useSearchParams, so each app's provider feeds it.
 */
const QueryStringContext = createContext<string>('');

export default QueryStringContext;
