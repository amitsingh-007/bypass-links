import { SvgIcon } from '@mui/material';
import { STORAGE_KEYS } from '@common/constants/storage';
import storage from 'GlobalHelpers/chrome/storage';
import tabs from 'GlobalHelpers/chrome/tabs';
import { RootState } from 'GlobalReducers/rootReducer';
import { memo, useState } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import StyledButton from './StyledButton';
import useHistoryStore from 'GlobalStore/history';

const OpenDefaultsButton = memo(function OpenDefaultsButton() {
  const startHistoryMonitor = useHistoryStore(
    (state) => state.startHistoryMonitor
  );
  const { isSignedIn } = useSelector((state: RootState) => state.root);
  const [isFetching, setIsFetching] = useState(false);

  const handleOpenDefaults = async () => {
    setIsFetching(true);
    startHistoryMonitor();
    const { [STORAGE_KEYS.redirections]: redirections } = await storage.get([
      STORAGE_KEYS.redirections,
    ]);
    const defaults = redirections.filter(
      ({ isDefault }: { isDefault: boolean }) => isDefault
    );
    defaults
      .filter((data: any) => data && data.alias && data.website)
      .forEach(({ website }: any) => {
        tabs.create({ url: atob(website), selected: false });
      });
    setIsFetching(false);
  };

  return (
    <StyledButton
      showSuccessColor={isSignedIn}
      isLoading={isFetching}
      isDisabled={!isSignedIn}
      onClick={handleOpenDefaults}
      color="warning"
    >
      <SvgIcon>
        <FiExternalLink />
      </SvgIcon>
    </StyledButton>
  );
});

export default OpenDefaultsButton;
