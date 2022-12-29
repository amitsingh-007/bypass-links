import { Center, Text, ThemeIcon } from '@mantine/core';
import { memo, useContext } from 'react';
import { HiFolder } from 'react-icons/hi';
import DynamicContext from '../../../provider/DynamicContext';
import { getBookmarksPanelUrl } from '../utils/url';

export interface Props {
  name: string;
  isEmpty: boolean;
  resetSelectedBookmarks?: React.MouseEventHandler<HTMLDivElement>;
}

const Folder = memo<Props>(function Folder({
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
      p={6}
      sx={{
        gap: '12px',
        opacity: isEmpty ? 0.6 : 1,
        cursor: isEmpty ? 'not-allowed' : 'inherit',
      }}
      onClick={resetSelectedBookmarks}
      onDoubleClick={handleFolderOpen}
    >
      <ThemeIcon
        size={20}
        variant="outline"
        color="yellow"
        sx={{ border: 'unset' }}
      >
        <HiFolder size={20} />
      </ThemeIcon>
      <Text size={15} lineClamp={1} sx={{ flex: 1 }} fw="bold">
        {origName}
      </Text>
    </Center>
  );
});

export default Folder;
