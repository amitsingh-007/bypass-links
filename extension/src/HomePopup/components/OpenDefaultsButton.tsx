import { SvgIcon } from "@material-ui/core";
import { STORAGE_KEYS } from "GlobalConstants";
import storage from "GlobalHelpers/chrome/storage";
import tabs from "GlobalHelpers/chrome/tabs";
import { RootState } from "GlobalReducers/rootReducer";
import { memo, useState } from "react";
import { FiExternalLink } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { startHistoryMonitor } from "SrcPath/HistoryPanel/actionCreators";
import StyledButton from "./StyledButton";

const OpenDefaultsButton = memo(function OpenDefaultsButton() {
  const dispatch = useDispatch();
  const { isSignedIn } = useSelector((state: RootState) => state.root);
  const [isFetching, setIsFetching] = useState(false);

  const handleOpenDefaults = async () => {
    setIsFetching(true);
    dispatch(startHistoryMonitor());
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
