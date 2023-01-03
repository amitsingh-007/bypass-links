import storage from '@helpers/chrome/storage';
import { memo, useEffect } from 'react';
import { getPersons } from '@helpers/fetchFromStorage';
import { IUpdateTaggedPerson } from '@bypass/shared';
import { setPersonsInStorage } from '@/PersonsPanel/utils';
import useHistoryStore from '@store/history';
import usePersonStore from '@store/person';

const THIRTY_SECONDS = 30 * 1000; //in milliseconds

const isHistoryAlreadyActive = async () => {
  const { historyStartTime } = await storage.get(['historyStartTime']);
  return Boolean(historyStartTime);
};

export const startHistoryWatch = async () => {
  if (await isHistoryAlreadyActive()) {
    return;
  }
  await storage.set({
    historyStartTime: Date.now() - THIRTY_SECONDS,
  });
};

const getSeparatedPersons = (prevPersons: string[], newPersons: string[]) => {
  const prevPersonsSet = new Set(prevPersons);
  const newPersonsSet = new Set(newPersons);
  const unchangedPersons = [...prevPersons].filter((uid) =>
    newPersonsSet.has(uid)
  );
  const removedPersons = [...prevPersons].filter(
    (uid) => !newPersonsSet.has(uid)
  );
  const addedPersons = [...newPersons].filter(
    (uid) => !prevPersonsSet.has(uid)
  );
  return {
    removedPersons,
    addedPersons,
    unchangedPersons,
  };
};

const updateUrlsInTaggedPersons = async (updates: IUpdateTaggedPerson[]) => {
  if (!updates || !updates.length) {
    return;
  }
  const persons = await getPersons();
  updates.forEach(({ prevTaggedPersons, newTaggedPersons, urlHash }) => {
    const { removedPersons, addedPersons } = getSeparatedPersons(
      prevTaggedPersons,
      newTaggedPersons
    );
    //Do nothing if no change
    if (!removedPersons.length && !addedPersons.length) {
      return;
    }
    //Remove urlHash for removed persons
    removedPersons.forEach((personUid) => {
      const { taggedUrls } = persons[personUid];
      if (!taggedUrls || taggedUrls.length < 1) {
        throw new Error(`No taggedUrls found against uid: ${personUid}`);
      }
      persons[personUid].taggedUrls = taggedUrls.filter(
        (hash) => hash !== urlHash
      );
    });
    //Add urlHash to added persons
    addedPersons.forEach((personUid) => {
      const taggedUrls = persons[personUid].taggedUrls || [];
      taggedUrls.push(urlHash);
      persons[personUid].taggedUrls = taggedUrls;
    });
  });
  await setPersonsInStorage(persons);
};

const StoreListener = memo(function StoreListener() {
  const updateTaggedUrls = usePersonStore((state) => state.updateTaggedUrls);
  const monitorHistory = useHistoryStore((state) => state.monitorHistory);

  useEffect(() => {
    if (monitorHistory) {
      startHistoryWatch();
    }
  }, [monitorHistory]);

  useEffect(() => {
    if (updateTaggedUrls) {
      updateUrlsInTaggedPersons(updateTaggedUrls);
    }
  }, [updateTaggedUrls]);

  return null;
});

export default StoreListener;
