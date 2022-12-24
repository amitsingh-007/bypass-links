import { AuthenticationEvent } from '@interfaces/authentication';
import useAuthStore from '@store/auth';

export class AuthProgress {
  private static _total: number;
  private static _curProgress: number;

  static initialize = (total: number) => {
    this._total = total;
    this._curProgress = -1;
  };

  static dispatchAuthenticationEvent = (authProgressObj: AuthenticationEvent) =>
    useAuthStore.setState({ authProgress: authProgressObj });

  static start = (message: string) => {
    this.dispatchAuthenticationEvent({
      message,
      progress: ++this._curProgress,
      total: this._total,
    });
  };

  static update = (message: string) => {
    this.dispatchAuthenticationEvent({
      message,
      progress: this._curProgress,
      total: this._total,
    });
  };

  static finish = (message: string) => {
    this.dispatchAuthenticationEvent({
      message,
      progress: this._curProgress + 1,
      total: this._total,
    });
  };
}
