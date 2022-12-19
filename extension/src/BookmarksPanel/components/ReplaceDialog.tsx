import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { VoidFunction } from '@bypass/shared/interfaces/custom';
import { MdClose } from 'react-icons/md';
import { useState, useEffect } from 'react';
import { getBookmarks, getPersons } from 'GlobalHelpers/fetchFromStorage';
import { TbReplace } from 'react-icons/tb';
import {
  getDecryptedBookmark,
  getEncryptedBookmark,
} from '@bypass/shared/components/Bookmarks/mapper';
import md5 from 'md5';
import storage from 'GlobalHelpers/chrome/storage';
import { addToCache } from '@bypass/shared/utils/cache';
import { CACHE_BUCKET_KEYS } from '@bypass/shared/constants/cache';
import { getFaviconProxyUrl } from '@bypass/shared/utils';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@bypass/shared/constants/routes';
import { setPersonsInStorage } from 'SrcPath/PersonsPanel/utils';
import { setBookmarksInStorage } from '../utils';

interface ILogData {
  title: string;
  url: string;
}

const ReplaceDialog: React.FC<{
  onClose: VoidFunction;
}> = ({ onClose }) => {
  const navigate = useNavigate();
  const [isReplacing, setIsReplacing] = useState(false);
  const [prevHost, setPrevHost] = useState<string | undefined>('https://');
  const [newHost, setNewHost] = useState<string | undefined>('https://');
  const [logData, setLogData] = useState<ILogData[]>([]);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [reloadPage, setReloadPage] = useState(false);

  const initPending = async () => {
    const { hasPendingBookmarks } = await storage.get('hasPendingBookmarks');
    const { hasPendingPersons } = await storage.get('hasPendingPersons');
    setHasPendingChanges(hasPendingBookmarks || hasPendingPersons);
  };

  useEffect(() => {
    initPending();
  }, []);

  const handleDialogClose: DialogProps['onClose'] = (_event, reason) => {
    if (reason === 'backdropClick') {
      return;
    }
    onClose();
  };

  const handleCloseButtonClick = () => {
    if (reloadPage) {
      navigate(ROUTES.HOMEPAGE);
    } else {
      onClose();
    }
  };

  const handlePrevHostnameChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setPrevHost(event.target.value);
  };

  const handleNewHostnameChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setNewHost(event.target.value);
  };

  const handleReplace = async () => {
    if (!prevHost || !newHost) {
      return;
    }
    setIsReplacing(true);
    try {
      const prevHostname = new URL(prevHost).hostname;
      const newHostname = new URL(newHost).hostname;
      console.log(prevHostname, newHostname);
      const { folders, urlList, folderList } = await getBookmarks();
      const persons = await getPersons();
      Object.entries(urlList).forEach(([oldUrlhash, value]) => {
        const bookmark = getDecryptedBookmark(value);
        const curUrl = new URL(bookmark.url);
        console.log(curUrl.href, curUrl.hostname);
        if (curUrl.hostname === prevHostname) {
          //1. Change in urlList
          curUrl.hostname = newHostname;
          const newUrl = curUrl.href;
          const newUrlHash = md5(newUrl);
          urlList[newUrlHash] = getEncryptedBookmark({
            ...bookmark,
            url: newUrl,
          });
          delete urlList[oldUrlhash];
          //2. Change in folders
          const metaData = folders[bookmark.parentHash].find(
            (data) => !data.isDir && data.hash === oldUrlhash
          );
          if (metaData) {
            metaData.hash = newUrlHash;
          }
          //3. Replace in persons
          bookmark.taggedPersons.forEach((personUid) => {
            const oldTaggedUrls = persons[personUid].taggedUrls || [];
            const newTaggedUrls = oldTaggedUrls.filter((x) => x !== oldUrlhash);
            newTaggedUrls.push(newUrlHash);
            persons[personUid].taggedUrls = newTaggedUrls;
          });
          //4. Update logs
          setLogData((prev) => {
            return [...prev, { title: bookmark.title, url: bookmark.url }];
          });
        }
      });
      //5. Add new hostname to favicons cache
      addToCache(CACHE_BUCKET_KEYS.favicon, getFaviconProxyUrl(newHost));
      //6. Update final result in storage
      await setBookmarksInStorage({ folderList, folders, urlList });
      await setPersonsInStorage(persons);
      setReloadPage(true);
    } catch (e) {
      console.error('Error while replacing', e);
    } finally {
      setIsReplacing(false);
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open
      disableEscapeKeyDown
      onClose={handleDialogClose}
    >
      <DialogTitle>Replace Form</DialogTitle>
      <DialogContent
        sx={{
          '& .MuiTextField-root, .MuiFormControl-root': {
            margin: (theme) => theme.spacing(1),
          },
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {hasPendingChanges ? (
          <Typography
            color="red"
            sx={{ color: (theme) => theme.palette.error.light }}
          >
            You have some pending changes to be synced. Please sync local
            changes before to continue
          </Typography>
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <TextField
                size="small"
                label="Old Hostname"
                variant="outlined"
                title={prevHost}
                value={prevHost}
                onChange={handlePrevHostnameChange}
                disabled={isReplacing}
                required
              />
              <TextField
                size="small"
                label="New Hostname"
                variant="outlined"
                title={newHost}
                value={newHost}
                onChange={handleNewHostnameChange}
                disabled={isReplacing}
                required
              />
              <Button
                variant="outlined"
                startIcon={<TbReplace />}
                onClick={handleReplace}
                size="small"
                color="primary"
                sx={{ height: 'fit-content' }}
                disabled={isReplacing}
              >
                Replace
              </Button>
            </Box>
            <Box sx={{ overflow: 'hidden auto' }}>
              <List dense>
                {logData.map((data) => (
                  <ListItem key={data.url}>
                    <ListItemText
                      primary={data.title}
                      secondary={data.url}
                      sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          pt: 0,
          display: 'flex',
          justifyContent: 'flex-end',
          width: '100%',
          px: '24px',
          pb: '10px',
        }}
      >
        <Button
          variant="outlined"
          startIcon={<MdClose />}
          onClick={handleCloseButtonClick}
          size="small"
          color="error"
          disabled={isReplacing}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReplaceDialog;
