import { dispatchAuthenticationEvent } from "./authentication";

export class AuthProgress {
  private static total: number;

  private static curProgress: number;

  static initialize = (total: number) => {
    this.total = total;
    this.curProgress = -1;
  };

  static start = (message: string) => {
    dispatchAuthenticationEvent({
      message,
      progress: ++this.curProgress,
      progressBuffer: this.curProgress + 1,
      total: this.total,
    });
  };

  static update = (message: string) => {
    dispatchAuthenticationEvent({
      message,
      progress: this.curProgress,
      progressBuffer: this.curProgress + 1,
      total: this.total,
    });
  };

  static finish = (message: string) => {
    dispatchAuthenticationEvent({
      message,
      progress: this.curProgress + 1,
      progressBuffer: this.curProgress + 1,
      total: this.total,
    });
  };
}
