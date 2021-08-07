import { getUpdates } from "@logic/index";

const allList = [
  { id: "4", name: "d" },
  { id: "3", name: "c1" },
  { id: "7", name: "g" },
  { id: "2", name: "b" },
  { id: "5", name: "e" },
  { id: "1", name: "a" },
  { id: "6", name: "f1" },
];

const updateList = [
  { id: "7", name: "g" },
  { id: "6", name: "f2" },
  { id: "3", name: "c2" },
  { id: "11", name: "e" },
  { id: "9", name: "k" },
  { id: "1", name: "a" },
];

describe("getUpdates test", () => {
  it("should return correct delete and update list on valid all list and update list", () => {
    expect(getUpdates(allList, updateList, "id")).toStrictEqual({
      deleteList: [
        { id: "4", name: "d" },
        { id: "2", name: "b" },
        { id: "5", name: "e" },
      ],
      updateList: [
        { id: "7", name: "g" },
        { id: "6", name: "f2" },
        { id: "3", name: "c2" },
        { id: "11", name: "e" },
        { id: "9", name: "k" },
        { id: "1", name: "a" },
      ],
    });
  });
  it("should return correct delete and update list when there is no overlap in update and all list", () => {
    const updateList = [
      { id: "90", name: "k2" },
      { id: "91", name: "a2" },
    ];
    expect(getUpdates(allList, updateList, "id")).toStrictEqual({
      deleteList: allList,
      updateList,
    });
  });

  it("should return all list as update list and empty delete list when input update list is same as all list", () => {
    expect(getUpdates(allList, allList, "id")).toStrictEqual({
      deleteList: [],
      updateList: allList,
    });
  });

  it("should return all list as delete and empty update list when input update list is empty", () => {
    expect(getUpdates(allList, [] as any[], "id")).toStrictEqual({
      deleteList: allList,
      updateList: [],
    });
  });

  it("should return same update list as input and empty delete list when all list is empty", () => {
    expect(getUpdates([], updateList, "id")).toStrictEqual({
      deleteList: [],
      updateList,
    });
  });

  it("should return empty delete and update list for invalid identifier", () => {
    expect(
      getUpdates(allList, updateList, "uid" as unknown as "id")
    ).toStrictEqual({
      deleteList: [],
      updateList,
    });
  });
});
