import { IconButton } from "@material-ui/core";
import OpenInNewTwoToneIcon from "@material-ui/icons/OpenInNewTwoTone";
import storage from "ChromeApi/storage";
import tabs from "ChromeApi/tabs";
import { startHistoryMonitor } from "GlobalActionCreators/index";
import { COLOR } from "GlobalConstants/color";
import { STORAGE_KEYS } from "GlobalConstants/index";
import { getActiveDisabledColor } from "GlobalUtils/color";
import { memo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconButtonLoader } from "./Loader";

export const OpenDefaultsButton = memo(() => {
  const dispatch = useDispatch();
  const isSignedIn = useSelector((state) => state.isSignedIn);
  const [isFetching, setIsFetching] = useState(false);

  const handleOpenDefaults = async () => {
    setIsFetching(true);
    dispatch(startHistoryMonitor());
    const { [STORAGE_KEYS.redirections]: redirections } = await storage.get([
      STORAGE_KEYS.redirections,
    ]);
    const defaults = redirections.filter(({ isDefault }) => isDefault);
    defaults
      .filter((data) => data && data.alias && data.website)
      .forEach(({ website }) => {
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
