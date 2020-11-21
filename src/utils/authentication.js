import { googleSignIn } from "./firebase";
import { syncFirebaseToStorage } from "./syncFirebaseToStorage";

export const signIn = () => {
  googleSignIn()
    .then((response) => {
      console.log("Login Success ", response);
      syncFirebaseToStorage();
      return true;
    })
    .catch((err) => {
      console.error("Error occured while signing in. ", err);
      return false;
    });
};
