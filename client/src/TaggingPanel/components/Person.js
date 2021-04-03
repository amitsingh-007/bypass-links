import React, { memo } from "react";

const Person = memo(({ person }) => {
  const { name, imageRef, taggedUrls } = person;
  return (
    <div style={{ display: "inline-block" }}>
      <div>{name}</div>
      {/* <img src={imageUrl} width="30px" height="30px" alt={name} /> */}
    </div>
  );
});

export default Person;
