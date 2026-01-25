'use client';

import { Center, Text } from '@mantine/core';
import { memo, useContext } from 'react';
import { HiFolder } from 'react-icons/hi';
import DynamicContext from '../../../provider/DynamicContext';
import { getBookmarksPanelUrl } from '../utils/url';
import styles from './styles/Folder.module.css';

export interface FolderProps {
  id: string;
  name: string;
  isEmpty: boolean;
  resetSelectedBookmarks?: React.MouseEventHandler<HTMLDivElement>;
}

const Folder = memo<FolderProps>(
  ({ id, name: origName, isEmpty, resetSelectedBookmarks }) => {
    const { location } = useContext(DynamicContext);

    const handleFolderOpen = () => {
      if (!isEmpty) {
        location.push(getBookmarksPanelUrl({ folderId: id }));
      }
    };

    return (
      <Center
        w="100%"
        h="100%"
        p="0.375rem"
        data-testid={`folder-item-${origName}`}
        className={styles.container}
        opacity={isEmpty ? 0.6 : 1}
        style={{ cursor: isEmpty ? 'not-allowed' : 'inherit' }}
        onClick={resetSelectedBookmarks}
        onDoubleClick={handleFolderOpen}
      >
        <HiFolder size="1.25rem" className={styles.folderIcon} />
        <Text size="0.9375rem" lineClamp={1} className={styles.name} fw="bold">
          {origName}
        </Text>
      </Center>
    );
  }
);

export default Folder;
