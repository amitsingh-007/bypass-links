import { InViewHookResponse } from "react-intersection-observer";

export interface IntersectionObserverResponse extends InViewHookResponse {
  entry?: InViewHookResponse["entry"] & { isVisible?: boolean };
}
