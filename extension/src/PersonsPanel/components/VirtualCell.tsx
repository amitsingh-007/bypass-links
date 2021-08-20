import { Box } from "@material-ui/core";
import { memo } from "react";
import { areEqual } from "react-window";
import { IPerson } from "../interfaces/persons";
import { getReactKey } from "../utils";
import Person, { Props as PersonProps } from "./Person";

export interface VirtualCellProps {
  persons: IPerson[];
  handleEditPerson: PersonProps["handleEditPerson"];
  handlePersonDelete: PersonProps["handlePersonDelete"];
  openBookmarksListUid: PersonProps["openBookmarksListUid"];
}

const VirtualCell = memo<{
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: VirtualCellProps;
}>(({ columnIndex, rowIndex, data, style }) => {
  const {
    persons,
    handleEditPerson,
    handlePersonDelete,
    openBookmarksListUid,
  } = data;
  const index = getReactKey(rowIndex, columnIndex);
  if (index >= persons.length) {
    return null;
  }
  return (
    <Box style={style}>
      <Person
        person={persons[index]}
        handleEditPerson={handleEditPerson}
        handlePersonDelete={handlePersonDelete}
        openBookmarksListUid={openBookmarksListUid}
      />
    </Box>
  );
}, areEqual);
VirtualCell.displayName = "VirtualCell";

export default VirtualCell;
