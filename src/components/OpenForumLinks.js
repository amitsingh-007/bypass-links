import { IconButton } from "@material-ui/core";
import ForumTwoToneIcon from "@material-ui/icons/ForumTwoTone";
import storage from "ChromeApi/storage";
import tabs from "ChromeApi/tabs";
import { startHistoryMonitor } from "GlobalActionCreators/index";
import { COLOR } from "GlobalConstants/color";
import { STORAGE_KEYS } from "GlobalConstants/index";
import { getActiveDisabledColor } from "GlobalUtils/color";
import React, { memo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconButtonLoader } from "./Loader";

const OpenForumLinks = memo(() => {
  const dispatch = useDispatch();
  const isExtensionActive = useSelector((state) => state.isExtensionActive);
  const [isFetching, setIsFetching] = useState(false);

  const handleClick = async () => {
    setIsFetching(true);
    // dispatch(startHistoryMonitor());
    // defaults
    //   .filter((data) => data && data.alias && data.website)
    //   .forEach(({ website }) => {
    //     tabs.create({ url: atob(website), selected: false });
    //   });
    
    setIsFetching(false);
  };

  if (isFetching) {
    return <IconButtonLoader />;
  }

  return (
    <IconButton
      aria-label="ManualHistoryPanel"
      component="span"
      style={getActiveDisabledColor(isExtensionActive, COLOR.orange)}
      onClick={handleClick}
      title="Manual History Control"
      disabled={!isExtensionActive}
    >
      <ForumTwoToneIcon fontSize="large" />
    </IconButton>
  );
});

export default OpenForumLinks;
