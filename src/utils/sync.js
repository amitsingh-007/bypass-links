import { resetBypass, syncBypassToStorage } from "./bypass";
import { resetRedirections, syncRedirectionsToStorage } from "./redirect";

export const syncFirebaseToStorage = async () => {
  await syncRedirectionsToStorage();
  await syncBypassToStorage();
};

export const resetStorage = async () => {
  await resetRedirections();
  await resetBypass();
};
