import { Box } from "@mui/material";
import { ScrollButton } from "GlobalComponents/ScrollButton";
import { PANEL_SIZE, PERSON_SIZE } from "GlobalConstants/styles";
import { deserialzeQueryStringToObject } from "GlobalUtils/url";
import { memo, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { FixedSizeGrid } from "react-window";
import { GRID_COLUMN_SIZE } from "../constants";
import { IPerson } from "../interfaces/persons";
import { getReactKey } from "../utils";
import VirtualCell, { VirtualCellProps } from "./VirtualCell";

interface Props {
  persons: IPerson[];
  handleEditPerson: (person: IPerson) => void;
  handlePersonDelete: (person: IPerson) => void;
}

const Persons = memo<Props>(function Persons({
  persons,
  handleEditPerson,
  handlePersonDelete,
}) {
  const history = useHistory();
  const gridRef = useRef<any>(null);
  const [openBookmarksListUid, setOpenBookmarksListUid] = useState("");

  useEffect(() => {
    const { openBookmarksList } = deserialzeQueryStringToObject(
      history.location.search
    );
    setOpenBookmarksListUid(openBookmarksList);
  }, [history.location.search]);

  const handleScroll = (itemNumber: number) => {
    gridRef.current?.scrollToItem({ rowIndex: itemNumber });
  };

  const rowCount = Math.ceil(persons.length / GRID_COLUMN_SIZE);

  return (
    <>
      <ScrollButton itemsSize={rowCount} onScroll={handleScroll} />
      <Box sx={{ padding: "6px" }}>
        <FixedSizeGrid<VirtualCellProps>
          height={PANEL_SIZE.height - 6 - 6} //Adjust for top and bottom padding
          width={PANEL_SIZE.width}
          rowCount={rowCount}
          rowHeight={PERSON_SIZE.height}
          columnCount={GRID_COLUMN_SIZE}
          columnWidth={PERSON_SIZE.width}
          overscanRowCount={2}
          itemKey={({ rowIndex, columnIndex, data }) => {
            const person = data.persons[getReactKey(rowIndex, columnIndex)];
            return person?.uid ?? `${rowIndex}_${columnIndex}`;
          }}
          itemData={{
            persons,
            handleEditPerson,
            handlePersonDelete,
            openBookmarksListUid,
          }}
          ref={gridRef}
        >
          {VirtualCell}
        </FixedSizeGrid>
      </Box>
    </>
  );
});

export default Persons;
