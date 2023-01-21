import { IBookmarkOperation } from '../constants';

export interface BMPanelQueryParams {
  folderContext: string;
  operation: IBookmarkOperation;
  bmUrl: string;
}
