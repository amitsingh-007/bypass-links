import storage from "ChromeApi/storage";
import { memo, useEffect } from "react";
import { useSelector } from "react-redux";
import { DEFAULT_PERSON_UID } from "SrcPath/TaggingPanel/constants";
import {
  getPersons,
  setPersonsInStorage,
} from "SrcPath/TaggingPanel/utils/index";

const THIRTY_SECONDS = 30 * 1000; //in milliseconds

const isHistoryAlreadyActive = async () => {
  const { historyStartTime } = await storage.get(["historyStartTime"]);
  return Boolean(historyStartTime);
};

export const startHistoryWatch = async () => {
  if (await isHistoryAlreadyActive()) {
    return;
  }
  await storage.set({
    historyStartTime: new Date() - THIRTY_SECONDS, //to compensate for open defaults
  });
};

const updateUrlsInTaggedPersons = async (updates) => {
  if (!updates || !updates.length) {
    return;
  }
  const persons = await getPersons();
  updates.forEach(({ prevUid, newUid, urlHash }) => {
    //Do nothing if no change
    if (prevUid === newUid) {
      return;
    }
    //Remove hash from prevUid
    if (prevUid !== DEFAULT_PERSON_UID || newUid === DEFAULT_PERSON_UID) {
      const { taggedUrls } = persons[prevUid];
      if (!taggedUrls || taggedUrls.length < 1) {
        throw new Error(`No taggedUrls found against uid: ${prevUid}`);
      }
      persons[prevUid].taggedUrls = taggedUrls.filter(
        (hash) => hash !== urlHash
      );
    }
    //Add hash to newUid
    if (prevUid === DEFAULT_PERSON_UID || newUid !== DEFAULT_PERSON_UID) {
      const taggedUrls = persons[newUid].taggedUrls || [];
      taggedUrls.push(urlHash);
      persons[newUid].taggedUrls = taggedUrls;
    }
  });
  await setPersonsInStorage(persons);
};

const StoreListener = memo(() => {
  const { startHistoryMonitor, updateTaggedUrls } = useSelector(
    (state) => state
  );

  useEffect(() => {
    if (startHistoryMonitor) {
      startHistoryWatch();
    }
  }, [startHistoryMonitor]);

  useEffect(() => {
    updateUrlsInTaggedPersons(updateTaggedUrls);
  }, [updateTaggedUrls]);

  return null;
});

export default StoreListener;
