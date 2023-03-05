import { Center, Text, ThemeIcon } from '@mantine/core';
import { memo, useContext } from 'react';
import { HiFolder } from 'react-icons/hi';
import DynamicContext from '../../../provider/DynamicContext';
import { getBookmarksPanelUrl } from '../utils/url';

export interface FolderProps {
  name: string;
  isEmpty: boolean;
  resetSelectedBookmarks?: React.MouseEventHandler<HTMLDivElement>;
}

const Folder = memo<FolderProps>(function Folder({
  name: origName,
  isEmpty,
  resetSelectedBookmarks,
}) {
  const { location } = useContext(DynamicContext);

  const handleFolderOpen = () => {
    if (!isEmpty) {
      location.push(getBookmarksPanelUrl({ folderContext: origName }));
    }
  };

  return (
    <Center
      w="100%"
      h="100%"
      p="0.375rem"
      opacity={isEmpty ? 0.6 : 1}
      sx={{ gap: '0.75rem', cursor: isEmpty ? 'not-allowed' : 'inherit' }}
      onClick={resetSelectedBookmarks}
      onDoubleClick={handleFolderOpen}
    >
      <ThemeIcon
        size="1.25rem"
        variant="outline"
        color="yellow"
        sx={{ border: 'unset' }}
      >
        <HiFolder size="1.25rem" />
      </ThemeIcon>
      <Text size="0.9375rem" lineClamp={1} sx={{ flex: 1 }} fw="bold">
        {origName}
      </Text>
    </Center>
  );
});

export default Folder;
