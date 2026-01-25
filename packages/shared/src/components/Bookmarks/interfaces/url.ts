import { type EBookmarkOperation } from '../constants';

export interface BMPanelQueryParams {
  folderId: string;
  operation: EBookmarkOperation;
  bmUrl: string;
}
