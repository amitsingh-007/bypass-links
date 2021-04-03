import { Box } from "@material-ui/core";
import React, { memo } from "react";
import Person from "./Person";

const Persons = memo(({ persons }) => {
  return (
    <Box sx={{ padding: "0 6px" }}>
      {persons.map((person) => (
        <Person person={person} key={person.uid} />
      ))}
    </Box>
  );
});

export default Persons;
