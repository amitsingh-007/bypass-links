export const bookmarkRowStyles = {
  paddingLeft: "12px",
  paddingRight: "9px",
  paddingY: "2px",
};

export const BOOKMARK_ROW_DIMENTSIONS = {
  height: 29,
  width: 793,
};
export const BOOKMARK_PANEL_CONTENT_HEIGHT = 532;

export const BM_COUNT_IN_INITAL_VIEW = Math.ceil(
  BOOKMARK_PANEL_CONTENT_HEIGHT / BOOKMARK_ROW_DIMENTSIONS.height
);

export enum BOOKMARK_OPERATION {
  NONE,
  ADD,
  EDIT,
}
