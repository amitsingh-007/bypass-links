import {
  EBookmarkOperation,
  getBookmarksPanelUrl,
  ROOT_FOLDER_ID,
} from '@bypass/shared';
import { useLocation, useSearchParams } from 'wouter';

const useBookmarkPanelParams = () => {
  const [, navigate] = useLocation();
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get('folderId') ?? ROOT_FOLDER_ID;
  const operation =
    Object.values(EBookmarkOperation).find(
      (value) => value === searchParams.get('operation')
    ) ?? EBookmarkOperation.NONE;

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
    folderId,
    operation,
    bmUrl: searchParams.get('bmUrl') ?? '',
    setOperation,
  };
};

export default useBookmarkPanelParams;
