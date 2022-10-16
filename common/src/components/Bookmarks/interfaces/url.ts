import { BOOKMARK_OPERATION } from '@common/components/Bookmarks/constants';

export interface BMPanelQueryParams {
  folderContext: string;
  operation: BOOKMARK_OPERATION;
  bmUrl: string;
}
