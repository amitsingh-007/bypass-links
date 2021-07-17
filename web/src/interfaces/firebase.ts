import { FIREBASE_DB_REF } from "@common/constants/firebase";

export interface Firebase {
  ref: FIREBASE_DB_REF;
  uid?: string;
  isAbsolute?: boolean;
  data: any;
}
