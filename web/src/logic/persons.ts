import { IPerson } from "@common/interfaces/person";
import { deletePersons, getPersons, upsertPersons } from "@database/persons";
import { getUpdates } from ".";

export const updatePersons = async (
  userId: string,
  persons: Omit<IPerson, "taggedUrls">[]
): Promise<boolean> => {
  const allPersons = (await getPersons(userId)) || [];
  if (!persons) {
    return false;
  }
  const { updateList, deleteList } = getUpdates(allPersons, persons, "id");
  let isSuccess = true;
  if (updateList?.length > 0) {
    isSuccess = await upsertPersons(userId, updateList);
  }
  if (deleteList?.length > 0) {
    isSuccess = await deletePersons(userId, deleteList);
  }
  return isSuccess;
};
