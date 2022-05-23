import { setAuthenticationProgress } from 'GlobalActionCreators/auth';
import { AuthenticationEvent } from 'GlobalInterfaces/authentication';
import { Dispatch } from 'redux';

export class AuthProgress {
  private static _total: number;
  private static _curProgress: number;
  private static _dispatch: Dispatch;

  static initialize = (total: number, dispatch: Dispatch) => {
    this._total = total;
    this._curProgress = -1;
    this._dispatch = dispatch; // dispatch will remain same untill we pass new store in Provider
  };

  static dispatchAuthenticationEvent = (
    authProgressObj: AuthenticationEvent
  ) => {
    this._dispatch(setAuthenticationProgress(authProgressObj));
  };

  static start = (message: string) => {
    this.dispatchAuthenticationEvent({
      message,
      progress: ++this._curProgress,
      progressBuffer: this._curProgress + 1,
      total: this._total,
    });
  };

  static update = (message: string) => {
    this.dispatchAuthenticationEvent({
      message,
      progress: this._curProgress,
      progressBuffer: this._curProgress + 1,
      total: this._total,
    });
  };

  static finish = (message: string) => {
    this.dispatchAuthenticationEvent({
      message,
      progress: this._curProgress + 1,
      progressBuffer: this._curProgress + 1,
      total: this._total,
    });
  };
}
