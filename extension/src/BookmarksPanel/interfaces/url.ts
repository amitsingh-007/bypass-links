import { BOOKMARK_OPERATION } from '../constants';

export interface BMPanelQueryParams {
  folderContext: string;
  operation: BOOKMARK_OPERATION;
  bmUrl: string;
}
