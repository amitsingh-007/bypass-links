import { Avatar, Badge, Box, IconButton, Typography } from '@mui/material';
import { memo, useEffect, useState, useContext } from 'react';
import DynamicContext from '../../../provider/DynamicContext';
import usePerson from '../hooks/usePerson';
import { IPerson } from '../interfaces/persons';
import { getPersonsPanelUrl } from '../utils/urls';

const imageStyles = { width: 100, height: 100 };

export interface Props {
  person: IPerson;
}

const Person = memo<Props>(function Person({ person }) {
  const { location } = useContext(DynamicContext);
  const { uid, name, taggedUrls } = person;
  const { resolvePersonImageFromUid } = usePerson();
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    resolvePersonImageFromUid(uid).then((url) => {
      setImageUrl(url);
    });
  }, [uid, person, resolvePersonImageFromUid]);

  const taggedUrlsCount =
    taggedUrls && !!taggedUrls.length ? taggedUrls.length : 0;

  const openBookmarksList = () => {
    location.push(getPersonsPanelUrl({ openBookmarksList: uid }));
  };

  return (
    <>
      <IconButton
        sx={{ padding: '0px', margin: '10px 0px' }}
        onClick={openBookmarksList}
      >
        <Box
          sx={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '4px 16px',
            cursor: 'pointer',
            height: '156px',
            width: '156px',
          }}
        >
          <Badge
            badgeContent={taggedUrlsCount}
            color="primary"
            overlap="circular"
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <Avatar alt={name} src={imageUrl} sx={imageStyles} />
          </Badge>
          <Typography
            sx={{
              display: '-webkit-box',
              fontSize: '14px',
              width: '110px',
              overflow: 'hidden',
              wordBreak: 'break-word',
              m: 'auto',
            }}
            style={{
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
            title={name}
          >
            {name}
          </Typography>
        </Box>
      </IconButton>
    </>
  );
});

export default Person;
