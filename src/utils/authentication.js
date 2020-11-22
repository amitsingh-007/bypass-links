import { googleSignIn } from "./firebase";
import { syncFirebaseToStorage } from "./syncFirebaseToStorage";
import storage from "../scripts/chrome/storage";

export const signIn = async () => {
  try {
    const response = await googleSignIn();
    console.log("Login Success ", response);
    syncFirebaseToStorage();
    storage.set({ isAuthenticated: true });
    return true;
  } catch (err) {
    console.error("Error occured while signing in. ", err);
    return false;
  }
};
