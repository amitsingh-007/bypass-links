export interface IRedirection {
  alias: string;
  website: string;
  isDefault: boolean;
}

export type IMappedRedirections = Record<string, string>;
