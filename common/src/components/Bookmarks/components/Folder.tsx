import { Box, SvgIcon, Typography } from '@mui/material';
import { memo, useContext } from 'react';
import { FcFolder } from 'react-icons/fc';
import { getBookmarksPanelUrl } from '../utils/url';
import { SxProps } from '@mui/system';
import DynamicContext from '../../../provider/DynamicContext';

export interface Props {
  name: string;
  isEmpty: boolean;
  resetSelectedBookmarks?: React.MouseEventHandler<HTMLDivElement>;
  containerStyles?: SxProps;
}

const Folder = memo<Props>(function Folder({
  name: origName,
  isEmpty,
  containerStyles = {},
  resetSelectedBookmarks,
}) {
  const { push } = useContext(DynamicContext);

  const handleFolderOpen = () => {
    if (!isEmpty) {
      push(getBookmarksPanelUrl({ folderContext: origName }));
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        ...containerStyles,
      }}
      onClick={resetSelectedBookmarks}
      onDoubleClick={handleFolderOpen}
    >
      <SvgIcon sx={{ fontSize: '21.5px' }}>
        <FcFolder />
      </SvgIcon>
      <Typography
        noWrap
        sx={{
          flexGrow: 1,
          marginLeft: '8px',
          fontSize: '14px',
          color: isEmpty ? 'lightslategray' : 'inherit',
        }}
      >
        {origName}
      </Typography>
    </Box>
  );
});

export default Folder;
