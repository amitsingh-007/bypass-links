import { Box, GlobalStyles } from "@mui/material";
import { displayToast } from "GlobalActionCreators/toast";
import { PANEL_DIMENSIONS_PX } from "GlobalConstants/styles";
import { getPersons } from "GlobalHelpers/fetchFromStorage";
import { removeImageFromFirebase } from "GlobalHelpers/firebase/storage";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { SORT_ORDER, SORT_TYPE } from "../constants/sort";
import { IPerson, IPersons } from "../interfaces/persons";
import { decryptionMapper } from "../mapper";
import {
  getFilteredPersons,
  getPersonPos,
  setPersonsInStorage,
} from "../utils";
import { sortAlphabetically, sortByBookmarksCount } from "../utils/sort";
import { updatePersonCacheAndImageUrls } from "../utils/sync";
import Header from "./Header";
import Persons from "./Persons";

const PersonsPanel = () => {
  const dispatch = useDispatch();
  const [persons, setPersons] = useState<IPerson[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    getPersons().then((persons) => {
      const decryptedPersons = Object.entries(persons || {}).map(
        decryptionMapper
      );
      setPersons(sortAlphabetically(SORT_ORDER.asc, decryptedPersons));
      setIsFetching(false);
    });
  }, []);

  const handleSave = async (persons: IPerson[]) => {
    const encryptedPersons = persons.reduce<IPersons>(
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

  const handleAddOrEditPerson = async (person: IPerson) => {
    setIsFetching(true);
    const pos = getPersonPos(persons, person);
    const newPersons = [...persons];
    if (pos === -1) {
      //Add person
      newPersons.push(person);
    } else {
      //Update person
      newPersons[pos] = person;
    }
    //Update person cache
    await updatePersonCacheAndImageUrls(person);
    //Update in the list
    const sortedPersons = sortAlphabetically(SORT_ORDER.asc, newPersons);
    setPersons(sortedPersons);
    await handleSave(sortedPersons);
    setIsFetching(false);
    dispatch(displayToast({ message: "Person added/updated succesfully" }));
  };

  const handlePersonDelete = async (person: IPerson) => {
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
    dispatch(displayToast({ message: "Person deleted succesfully" }));
  };

  const handleSort = (sortType: SORT_TYPE, sortOrder: SORT_ORDER) => {
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

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
  };

  const filteredPersons = getFilteredPersons(persons, searchText);
  return (
    <>
      <GlobalStyles
        styles={{ body: { "::-webkit-scrollbar": { width: "0px" } } }}
      />
      <Box sx={{ width: PANEL_DIMENSIONS_PX.width }}>
        <Header
          isFetching={isFetching}
          handleAddPerson={handleAddOrEditPerson}
          persons={filteredPersons}
          handleSort={handleSort}
          onSearchChange={handleSearchTextChange}
        />
        <Box sx={{ minHeight: PANEL_DIMENSIONS_PX.height }}>
          {filteredPersons.length > 0 ? (
            <Persons
              persons={filteredPersons}
              handleEditPerson={handleAddOrEditPerson}
              handlePersonDelete={handlePersonDelete}
            />
          ) : null}
        </Box>
      </Box>
    </>
  );
};

export default PersonsPanel;
