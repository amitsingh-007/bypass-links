import { Box } from "@material-ui/core";
import { deserialzeQueryStringToObject } from "GlobalUtils/url";
import { memo, useEffect, useState } from "react";
import { useHistory } from "react-router";
import Person from "./Person";

const isFirstPersonWithAlphabet = (persons, index) => {
  const name = persons[index].name;
  const prevName = persons[index - 1]?.name ?? "";
  return name[0] !== prevName[0];
};

const Persons = memo(({ persons, handleEditPerson, handlePersonDelete }) => {
  const [openBookmarksListUid, setOpenBookmarksListUidUid] = useState("");
  const history = useHistory();

  useEffect(() => {
    const { openBookmarksList } = deserialzeQueryStringToObject(
      history.location.search
    );
    setOpenBookmarksListUidUid(openBookmarksList);
  }, [history.location.search]);

  return (
    <Box sx={{ padding: "6px" }}>
      {persons.map((person, index) => (
        <Person
          key={person.uid}
          person={person}
          handleEditPerson={handleEditPerson}
          handlePersonDelete={handlePersonDelete}
          openBookmarksListUid={openBookmarksListUid}
          showAlphabetBadge={isFirstPersonWithAlphabet(persons, index)}
        />
      ))}
    </Box>
  );
});

export default Persons;
