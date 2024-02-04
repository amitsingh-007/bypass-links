import { AuthenticationEvent } from '@interfaces/authentication';
import useAuthStore from '@/store/authProgress';

export class AuthProgress {
  private static total: number;

  private static curProgress: number;

  static initialize = (total: number) => {
    this.total = total;
    this.curProgress = -1;
  };

  static dispatchAuthenticationEvent = (authProgressObj: AuthenticationEvent) =>
    useAuthStore.setState({ authProgress: authProgressObj });

  static start = (message: string) => {
    this.curProgress += 1;
    this.dispatchAuthenticationEvent({
      message,
      progress: this.curProgress,
      total: this.total,
    });
  };

  static update = (message: string) => {
    this.dispatchAuthenticationEvent({
      message,
      progress: this.curProgress,
      total: this.total,
    });
  };

  static finish = (message: string) => {
    this.dispatchAuthenticationEvent({
      message,
      progress: this.curProgress + 1,
      total: this.total,
    });
  };
}
