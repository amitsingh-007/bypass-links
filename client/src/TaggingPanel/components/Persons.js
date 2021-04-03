import React, { memo } from "react";
import Person from "./Person";

const Persons = memo(({ persons }) => {
  return persons.map((person) => <Person person={person} key={person.uid} />);
});

export default Persons;
