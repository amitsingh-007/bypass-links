import { IconButton } from "@material-ui/core";
import OpenInNewTwoToneIcon from "@material-ui/icons/OpenInNewTwoTone";
import storage from "GlobalHelpers/chrome/storage";
import tabs from "GlobalHelpers/chrome/tabs";
import { IconButtonLoader } from "GlobalComponents/Loader";
import { STORAGE_KEYS } from "GlobalConstants";
import { COLOR } from "GlobalConstants/color";
import { RootState } from "GlobalReducers/rootReducer";
import { getActiveDisabledColor } from "GlobalUtils/color";
import { memo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { startHistoryMonitor } from "SrcPath/HistoryPanel/actionCreators";

const OpenDefaultsButton = memo(() => {
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

  if (isFetching) {
    return <IconButtonLoader />;
  }

  return (
    <IconButton
      aria-label="OpenDefaults"
      component="span"
      style={getActiveDisabledColor(isSignedIn, COLOR.deepPurple)}
      onClick={handleOpenDefaults}
      disabled={!isSignedIn}
      title={isSignedIn ? "Open Defaults" : undefined}
    >
      <OpenInNewTwoToneIcon fontSize="large" />
    </IconButton>
  );
});

export default OpenDefaultsButton;
