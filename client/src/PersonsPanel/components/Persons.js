import { Box } from "@material-ui/core";
import { deserialzeQueryStringToObject } from "GlobalUtils/url";
import { memo, useEffect, useState } from "react";
import { useHistory } from "react-router";
import Person from "./Person";

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
    <Box sx={{ padding: "10px 6px" }}>
      {persons.map((person) => (
        <Person
          key={person.uid}
          person={person}
          handleEditPerson={handleEditPerson}
          handlePersonDelete={handlePersonDelete}
          openBookmarksListUid={openBookmarksListUid}
        />
      ))}
    </Box>
  );
});

export default Persons;
