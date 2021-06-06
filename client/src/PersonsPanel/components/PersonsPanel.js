import { Box } from "@material-ui/core";
import storage from "ChromeApi/storage";
import { STORAGE_KEYS } from "GlobalConstants";
import { PANEL_DIMENSIONS } from "GlobalConstants/styles";
import { removeImageFromFirebase } from "GlobalUtils/firebase";
import { useEffect, useState } from "react";
import { SORT_ORDER, SORT_TYPE } from "../constants/sort";
import { decryptionMapper } from "../mapper";
import { getPersonPos, setPersonsInStorage } from "../utils";
import { sortAlphabetically, sortByBookmarksCount } from "../utils/sort";
import { updatePersonCacheAndImageUrls } from "../utils/sync";
import Header from "./Header";
import Persons from "./Persons";

const PersonsPanel = () => {
  const [persons, setPersons] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    storage
      .get([STORAGE_KEYS.persons])
      .then(({ [STORAGE_KEYS.persons]: persons }) => {
        const decryptedPersons = Object.entries(persons || {}).map(
          decryptionMapper
        );
        setPersons(sortAlphabetically(SORT_ORDER.asc, decryptedPersons));
        setIsFetching(false);
      });
  }, []);

  const handleSave = async (persons) => {
    const encryptedPersons = persons.reduce(
      (obj, { uid, name, imageRef, taggedUrls }) => {
        obj[uid] = {
          uid,
          name: btoa(name),
          imageRef: btoa(encodeURIComponent(imageRef)),
          taggedUrls,
        };
        return obj;
      },
      {}
    );
    await setPersonsInStorage(encryptedPersons);
  };

  const handleAddOrEditPerson = async (person) => {
    setIsFetching(true);
    const pos = getPersonPos(persons, person);
    if (pos === -1) {
      //Add person
      persons.push(person);
    } else {
      //Update person
      persons[pos] = person;
    }
    //Update person cache
    await updatePersonCacheAndImageUrls(person);
    //Update in the list
    const sortedPersons = sortAlphabetically(SORT_ORDER.asc, persons);
    setPersons(sortedPersons);
    await handleSave(sortedPersons);
    setIsFetching(false);
  };

  const handlePersonDelete = async (person) => {
    const pos = getPersonPos(persons, person);
    if (persons[pos].taggedUrls?.length > 0) {
      console.error("Cant delete a person with tagged urls");
      return;
    }
    setIsFetching(true);
    const newPersons = [...persons];
    newPersons.splice(pos, 1);
    setPersons(newPersons);
    await removeImageFromFirebase(person.imageRef);
    await handleSave(newPersons);
    setIsFetching(false);
  };

  const handleSort = (sortType, sortOrder) => {
    let sortFn = null;
    if (sortType === SORT_TYPE.alphabetically) {
      sortFn = sortAlphabetically;
    } else if (sortType === SORT_TYPE.bookmarks) {
      sortFn = sortByBookmarksCount;
    } else {
      throw new Error("Unknown sort type encountered");
    }
    setPersons(sortFn(sortOrder, persons));
  };

  const sortedPersons = persons;
  return (
    <Box sx={{ width: PANEL_DIMENSIONS.width }}>
      <Header
        isFetching={isFetching}
        handleAddPerson={handleAddOrEditPerson}
        persons={sortedPersons}
        handleSort={handleSort}
      />
      <Box sx={{ minHeight: PANEL_DIMENSIONS.height }}>
        {sortedPersons.length > 0 ? (
          <Persons
            persons={sortedPersons}
            handleEditPerson={handleAddOrEditPerson}
            handlePersonDelete={handlePersonDelete}
          />
        ) : null}
      </Box>
    </Box>
  );
};

export default PersonsPanel;
