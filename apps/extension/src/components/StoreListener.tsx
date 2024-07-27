import { setPersonsInStorage } from '@/PersonsPanel/utils';
import { startHistoryWatch } from '@/utils/history';
import { IUpdateTaggedPerson } from '@bypass/shared';
import { getPersons } from '@helpers/fetchFromStorage';
import useHistoryStore from '@store/history';
import usePersonStore from '@store/person';
import { memo, useEffect } from 'react';

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
  if (!updates?.length) {
    return;
  }
  const persons = await getPersons();
  updates.forEach(({ prevTaggedPersons, newTaggedPersons, urlHash }) => {
    const { removedPersons, addedPersons } = getSeparatedPersons(
      prevTaggedPersons,
      newTaggedPersons
    );
    // Do nothing if no change
    if (removedPersons.length === 0 && addedPersons.length === 0) {
      return;
    }
    // Remove urlHash for removed persons
    removedPersons.forEach((personUid) => {
      const { taggedUrls } = persons[personUid];
      if (!taggedUrls?.length) {
        throw new Error(`No taggedUrls found against uid: ${personUid}`);
      }
      persons[personUid].taggedUrls = taggedUrls.filter(
        (hash) => hash !== urlHash
      );
    });
    // Add urlHash to added persons
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
