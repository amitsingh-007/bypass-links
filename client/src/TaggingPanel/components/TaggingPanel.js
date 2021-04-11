import { Box } from "@material-ui/core";
import storage from "ChromeApi/storage";
import { STORAGE_KEYS } from "GlobalConstants/index";
import { PANEL_DIMENSIONS } from "GlobalConstants/styles";
import { useEffect, useState } from "react";
import { decryptionMapper } from "../mapper";
import { setPersonsInStorage } from "../utils/index";
import Header from "./Header";
import Persons from "./Persons";

const TaggingPanel = () => {
  const [persons, setPersons] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    storage
      .get([STORAGE_KEYS.persons])
      .then(({ [STORAGE_KEYS.persons]: persons }) => {
        const decryptedPersons = Object.entries(persons || {}).map(
          decryptionMapper
        );
        setPersons(decryptedPersons);
        setIsFetching(false);
      });
  }, []);

  const handleSave = async (persons) => {
    setIsFetching(true);
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
    setIsFetching(false);
  };

  const handleAddPerson = async (person) => {
    const newPersons = [...persons, person];
    setPersons(newPersons);
    await handleSave(newPersons);
  };

  const handleEditPerson = async (updatedPerson) => {
    const pos = persons.findIndex(({ uid }) => uid === updatedPerson.uid);
    const newPersons = [...persons];
    newPersons[pos] = updatedPerson;
    setPersons(newPersons);
    await handleSave(newPersons);
  };

  return (
    <Box sx={{ width: PANEL_DIMENSIONS.width }}>
      <Header isFetching={isFetching} handleAddPerson={handleAddPerson} />
      <Box sx={{ minHeight: PANEL_DIMENSIONS.height }}>
        {!isFetching ? (
          <Persons persons={persons} handleEditPerson={handleEditPerson} />
        ) : null}
      </Box>
    </Box>
  );
};

export default TaggingPanel;
