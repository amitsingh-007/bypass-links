import { type EBookmarkOperation } from '../constants';

export interface BMPanelQueryParams {
  folderContext: string;
  operation: EBookmarkOperation;
  bmUrl: string;
}
