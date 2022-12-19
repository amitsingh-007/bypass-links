import { FIREBASE_DB_REF } from '@bypass/shared/constants/firebase';
import { SvgIcon, Typography } from '@mui/material';
import { BlackTooltip } from '@bypass/shared/components/StyledComponents';
import { getCurrentTab } from 'GlobalHelpers/chrome/tabs';
import { getLastVisited } from 'GlobalHelpers/fetchFromStorage';
import { saveToFirebase } from 'GlobalHelpers/firebase/database';
import md5 from 'md5';
import { memo, useEffect, useState } from 'react';
import { FaCalendarCheck, FaCalendarTimes } from 'react-icons/fa';
import { syncLastVisitedToStorage } from 'SrcPath/HomePopup/utils/lastVisited';
import { LastVisited } from '../interfaces/lastVisited';
import StyledButton from './StyledButton';
import useAuthStore from 'GlobalStore/auth';

const tooltipStyles = { fontSize: '13px' };

const LastVisitedButton = memo(function LastVisitedButton() {
  const isSignedIn = useAuthStore((state) => state.isSignedIn);
  const [isFetching, setIsFetching] = useState(false);
  const [lastVisited, setLastVisited] = useState('');
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [lastVisitedObj, setLastVisitedObj] = useState<LastVisited>({});

  const initLastVisited = async () => {
    setIsFetching(true);
    const lastVisitedObj = await getLastVisited();

    const currentTab = await getCurrentTab();
    const { hostname } = new URL(currentTab.url ?? '');
    const lastVisitedDate = lastVisitedObj[md5(hostname)];
    let displayInfo = '';
    if (lastVisitedDate) {
      const date = new Date(lastVisitedDate);
      displayInfo = `${date.toDateString()}, ${date.toLocaleTimeString()}`;
    }
    setLastVisited(displayInfo);
    setLastVisitedObj(lastVisitedObj);
    setCurrentTab(currentTab);
    setIsFetching(false);
  };

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    initLastVisited();
  }, [isSignedIn, lastVisited]);

  const handleUpdateLastVisited = async () => {
    setIsFetching(true);
    const { hostname } = new URL(currentTab?.url ?? '');
    lastVisitedObj[md5(hostname)] = Date.now();
    const isSuccess = await saveToFirebase(
      FIREBASE_DB_REF.lastVisited,
      lastVisitedObj
    );
    if (isSuccess) {
      await syncLastVisitedToStorage();
    }
    await initLastVisited();
    setIsFetching(false);
  };

  return (
    <StyledButton
      showSuccessColor={isSignedIn}
      isLoading={isFetching}
      isDisabled={!isSignedIn}
      onClick={handleUpdateLastVisited}
      color={lastVisited ? 'success' : 'error'}
    >
      {lastVisited ? (
        <BlackTooltip
          title={<Typography style={tooltipStyles}>{lastVisited}</Typography>}
          arrow
          disableInteractive
        >
          <SvgIcon>
            <FaCalendarCheck />
          </SvgIcon>
        </BlackTooltip>
      ) : (
        <SvgIcon>
          <FaCalendarTimes />
        </SvgIcon>
      )}
    </StyledButton>
  );
});

export default LastVisitedButton;
