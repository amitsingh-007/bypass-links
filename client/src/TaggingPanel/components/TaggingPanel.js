import { Box } from "@material-ui/core";
import storage from "ChromeApi/storage";
import Loader from "GlobalComponents/Loader";
import { STORAGE_KEYS } from "GlobalConstants/index";
import React, { useEffect, useState } from "react";
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
    <Box
      sx={{ width: "max-content", display: "flex", flexDirection: "column" }}
    >
      <Header handleAddPerson={handleAddPerson} />
      <Box sx={{ width: "792px", height: "540px" }}>
        {isFetching ? (
          <Loader
            display="flex"
            alignItems="center"
            height="100%"
            marginBottom="12px"
          />
        ) : (
          <Persons persons={persons} handleEditPerson={handleEditPerson} />
        )}
      </Box>
    </Box>
  );
};

export default TaggingPanel;
