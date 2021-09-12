import { AuthenticationEvent } from "GlobalInterfaces/authentication";
import { AUTHENTICATION_EVENT } from "../constants/auth";

export class AuthProgress {
  private static total: number;

  private static curProgress: number;

  static initialize = (total: number) => {
    this.total = total;
    this.curProgress = -1;
  };

  static dispatchAuthenticationEvent = (
    authProgressObj: AuthenticationEvent
  ) => {
    const event = new CustomEvent(AUTHENTICATION_EVENT, {
      detail: authProgressObj,
    });
    document.dispatchEvent(event);
  };

  static start = (message: string) => {
    this.dispatchAuthenticationEvent({
      message,
      progress: ++this.curProgress,
      progressBuffer: this.curProgress + 1,
      total: this.total,
    });
  };

  static update = (message: string) => {
    this.dispatchAuthenticationEvent({
      message,
      progress: this.curProgress,
      progressBuffer: this.curProgress + 1,
      total: this.total,
    });
  };

  static finish = (message: string) => {
    this.dispatchAuthenticationEvent({
      message,
      progress: this.curProgress + 1,
      progressBuffer: this.curProgress + 1,
      total: this.total,
    });
  };
}
