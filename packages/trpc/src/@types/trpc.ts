export interface ITRPCContext {
  reqMetaData: {
    ip: string | null;
    userAgent: string | undefined;
  };
  bearerToken?: string;
}
