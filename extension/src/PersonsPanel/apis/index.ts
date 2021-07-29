import { IPerson } from "@common/interfaces/person";
import fetchApi from "@common/utils/fetch";
import { getUserId } from "GlobalUtils/common";

export const fetchPersons = async (): Promise<IPerson[]> => {
  const userId = await getUserId();
  const { persons } = await fetchApi<{ persons: IPerson[] }>(
    `/api/persons?uid=${userId}`
  );
  return persons;
};

export const savePersons = async (persons: IPerson[]): Promise<boolean> => {
  const userId = await getUserId();
  const { isSuccess } = await fetchApi<{ isSuccess: boolean }>(
    `/api/persons?uid=${userId}`,
    {
      method: "POST",
      body: JSON.stringify({ persons }),
    }
  );
  return isSuccess;
};
