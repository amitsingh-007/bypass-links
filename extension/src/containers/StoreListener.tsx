import storage from "GlobalHelpers/chrome/storage";
import { RootState } from "GlobalReducers/rootReducer";
import { memo, useEffect } from "react";
import { useSelector } from "react-redux";
import { getPersons } from "GlobalHelpers/fetchFromStorage";
import { IUpdateTaggedPerson } from "SrcPath/PersonsPanel/interfaces/persons";
import { setPersonsInStorage } from "SrcPath/PersonsPanel/utils";

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
    historyStartTime: Date.now() - THIRTY_SECONDS,
  });
};

const getSeparatedPersons = (prevPersons: string[], newPersons: string[]) => {
  const prevPersonsSet = new Set(prevPersons);
  const newPersonsSet = new Set(newPersons);
  const unchangedPersons = [...prevPersons].filter((id) =>
    newPersonsSet.has(id)
  );
  const removedPersons = [...prevPersons].filter(
    (id) => !newPersonsSet.has(id)
  );
  const addedPersons = [...newPersons].filter((id) => !prevPersonsSet.has(id));
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
  const personsMap = new Map(persons.map((x) => [x.id, x]));
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
    removedPersons.forEach((personId) => {
      const person = personsMap.get(personId);
      if (!person || !person.taggedUrls?.length) {
        throw new Error(
          `Invalid person or No taggedUrls found for id: ${personId}`
        );
      }
      person.taggedUrls = person.taggedUrls.filter((hash) => hash !== urlHash);
      personsMap.set(personId, person);
    });
    //Add urlHash to added persons
    addedPersons.forEach((personId) => {
      const person = personsMap.get(personId);
      if (!person) {
        throw new Error(`Person not found for id: ${personId}`);
      }
      const taggedUrls = person.taggedUrls || [];
      taggedUrls.push(urlHash);
      person.taggedUrls = taggedUrls;
      personsMap.set(personId, person);
    });
  });
  await setPersonsInStorage(Array.from(personsMap.values()));
};

const StoreListener = memo(function StoreListener() {
  const { updateTaggedUrls } = useSelector((state: RootState) => state.persons);
  const { startHistoryMonitor } = useSelector(
    (state: RootState) => state.history
  );

  useEffect(() => {
    if (startHistoryMonitor) {
      startHistoryWatch();
    }
  }, [startHistoryMonitor]);

  useEffect(() => {
    if (updateTaggedUrls) {
      updateUrlsInTaggedPersons(updateTaggedUrls);
    }
  }, [updateTaggedUrls]);

  return null;
});

export default StoreListener;
