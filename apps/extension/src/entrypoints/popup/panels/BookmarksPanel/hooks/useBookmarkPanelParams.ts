import {
  type BMPanelQueryParams,
  EBookmarkOperation,
  getBookmarksPanelUrl,
} from '@bypass/shared';
import { useLocation, useSearch } from 'wouter';

const useBookmarkPanelParams = () => {
  const [, navigate] = useLocation();
  const { folderId, bmUrl, operation } = Object.fromEntries(
    new URLSearchParams(useSearch())
  ) as Partial<BMPanelQueryParams>;

  /** Rewrites only the operation part of the url; the folder stays where it is. */
  const setOperation = (
    newOperation: EBookmarkOperation,
    newBmUrl?: string
  ) => {
    navigate(
      getBookmarksPanelUrl({
        folderId,
        operation: newOperation,
        bmUrl: newBmUrl,
      }),
      { replace: true }
    );
  };

  return {
    folderId: folderId ?? '',
    operation: operation ?? EBookmarkOperation.NONE,
    bmUrl: bmUrl ?? '',
    setOperation,
  };
};

export default useBookmarkPanelParams;
