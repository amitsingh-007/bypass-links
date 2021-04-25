import { Box } from "@material-ui/core";
import { memo } from "react";
import Person from "./Person";

const Persons = memo(({ persons, handleEditPerson, handlePersonDelete }) => {
  return (
    <Box sx={{ padding: "0 30px" }}>
      {persons.map((person) => (
        <Person
          key={person.uid}
          person={person}
          handleEditPerson={handleEditPerson}
          handlePersonDelete={handlePersonDelete}
        />
      ))}
    </Box>
  );
});

export default Persons;
