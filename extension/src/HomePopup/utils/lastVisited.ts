import { STORAGE_KEYS } from "GlobalConstants";
import storage from "GlobalHelpers/chrome/storage";
import { getLastVisited } from "../apis/lastVisited";
import { LastVisited } from "../interfaces/lastVisited";

export const syncLastVisitedToStorage = async () => {
  const lastVisited = await getLastVisited();
  const mappedLastVisited = lastVisited.reduce<LastVisited>(
    (obj, { hostname, visitedOn }) => {
      obj[hostname] = new Date(visitedOn).getTime();
      return obj;
    },
    {}
  );
  await storage.set({ [STORAGE_KEYS.lastVisited]: mappedLastVisited });
  console.log(`Last visited is set to`, lastVisited);
};

export const resetLastVisited = async () => {
  await storage.remove(STORAGE_KEYS.lastVisited);
};
