/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/": {
    get: {
      responses: {
        /** OK */
        200: unknown;
      };
    };
  };
  "/auth": {
    get: {
      parameters: {
        query: {
          is_2fa_enabled?: parameters["rowFilter.auth.is_2fa_enabled"];
          totp_secret_key?: parameters["rowFilter.auth.totp_secret_key"];
          totp_auth_url?: parameters["rowFilter.auth.totp_auth_url"];
          user_id?: parameters["rowFilter.auth.user_id"];
          is_prod?: parameters["rowFilter.auth.is_prod"];
          /** Filtering Columns */
          select?: parameters["select"];
          /** Ordering */
          order?: parameters["order"];
          /** Limiting and Pagination */
          offset?: parameters["offset"];
          /** Limiting and Pagination */
          limit?: parameters["limit"];
        };
        header: {
          /** Limiting and Pagination */
          Range?: parameters["range"];
          /** Limiting and Pagination */
          "Range-Unit"?: parameters["rangeUnit"];
          /** Preference */
          Prefer?: parameters["preferCount"];
        };
      };
      responses: {
        /** OK */
        200: {
          schema: definitions["auth"][];
        };
        /** Partial Content */
        206: unknown;
      };
    };
    post: {
      parameters: {
        body: {
          /** auth */
          auth?: definitions["auth"];
        };
        query: {
          /** Filtering Columns */
          select?: parameters["select"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** Created */
        201: unknown;
      };
    };
    delete: {
      parameters: {
        query: {
          is_2fa_enabled?: parameters["rowFilter.auth.is_2fa_enabled"];
          totp_secret_key?: parameters["rowFilter.auth.totp_secret_key"];
          totp_auth_url?: parameters["rowFilter.auth.totp_auth_url"];
          user_id?: parameters["rowFilter.auth.user_id"];
          is_prod?: parameters["rowFilter.auth.is_prod"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
    patch: {
      parameters: {
        query: {
          is_2fa_enabled?: parameters["rowFilter.auth.is_2fa_enabled"];
          totp_secret_key?: parameters["rowFilter.auth.totp_secret_key"];
          totp_auth_url?: parameters["rowFilter.auth.totp_auth_url"];
          user_id?: parameters["rowFilter.auth.user_id"];
          is_prod?: parameters["rowFilter.auth.is_prod"];
        };
        body: {
          /** auth */
          auth?: definitions["auth"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
  };
  "/bypass_sites": {
    get: {
      parameters: {
        query: {
          user_id?: parameters["rowFilter.bypass_sites.user_id"];
          is_prod?: parameters["rowFilter.bypass_sites.is_prod"];
          hostname?: parameters["rowFilter.bypass_sites.hostname"];
          name?: parameters["rowFilter.bypass_sites.name"];
          /** Filtering Columns */
          select?: parameters["select"];
          /** Ordering */
          order?: parameters["order"];
          /** Limiting and Pagination */
          offset?: parameters["offset"];
          /** Limiting and Pagination */
          limit?: parameters["limit"];
        };
        header: {
          /** Limiting and Pagination */
          Range?: parameters["range"];
          /** Limiting and Pagination */
          "Range-Unit"?: parameters["rangeUnit"];
          /** Preference */
          Prefer?: parameters["preferCount"];
        };
      };
      responses: {
        /** OK */
        200: {
          schema: definitions["bypass_sites"][];
        };
        /** Partial Content */
        206: unknown;
      };
    };
    post: {
      parameters: {
        body: {
          /** bypass_sites */
          bypass_sites?: definitions["bypass_sites"];
        };
        query: {
          /** Filtering Columns */
          select?: parameters["select"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** Created */
        201: unknown;
      };
    };
    delete: {
      parameters: {
        query: {
          user_id?: parameters["rowFilter.bypass_sites.user_id"];
          is_prod?: parameters["rowFilter.bypass_sites.is_prod"];
          hostname?: parameters["rowFilter.bypass_sites.hostname"];
          name?: parameters["rowFilter.bypass_sites.name"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
    patch: {
      parameters: {
        query: {
          user_id?: parameters["rowFilter.bypass_sites.user_id"];
          is_prod?: parameters["rowFilter.bypass_sites.is_prod"];
          hostname?: parameters["rowFilter.bypass_sites.hostname"];
          name?: parameters["rowFilter.bypass_sites.name"];
        };
        body: {
          /** bypass_sites */
          bypass_sites?: definitions["bypass_sites"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
  };
  "/last_visited": {
    get: {
      parameters: {
        query: {
          user_id?: parameters["rowFilter.last_visited.user_id"];
          is_prod?: parameters["rowFilter.last_visited.is_prod"];
          hostname?: parameters["rowFilter.last_visited.hostname"];
          visited_on?: parameters["rowFilter.last_visited.visited_on"];
          /** Filtering Columns */
          select?: parameters["select"];
          /** Ordering */
          order?: parameters["order"];
          /** Limiting and Pagination */
          offset?: parameters["offset"];
          /** Limiting and Pagination */
          limit?: parameters["limit"];
        };
        header: {
          /** Limiting and Pagination */
          Range?: parameters["range"];
          /** Limiting and Pagination */
          "Range-Unit"?: parameters["rangeUnit"];
          /** Preference */
          Prefer?: parameters["preferCount"];
        };
      };
      responses: {
        /** OK */
        200: {
          schema: definitions["last_visited"][];
        };
        /** Partial Content */
        206: unknown;
      };
    };
    post: {
      parameters: {
        body: {
          /** last_visited */
          last_visited?: definitions["last_visited"];
        };
        query: {
          /** Filtering Columns */
          select?: parameters["select"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** Created */
        201: unknown;
      };
    };
    delete: {
      parameters: {
        query: {
          user_id?: parameters["rowFilter.last_visited.user_id"];
          is_prod?: parameters["rowFilter.last_visited.is_prod"];
          hostname?: parameters["rowFilter.last_visited.hostname"];
          visited_on?: parameters["rowFilter.last_visited.visited_on"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
    patch: {
      parameters: {
        query: {
          user_id?: parameters["rowFilter.last_visited.user_id"];
          is_prod?: parameters["rowFilter.last_visited.is_prod"];
          hostname?: parameters["rowFilter.last_visited.hostname"];
          visited_on?: parameters["rowFilter.last_visited.visited_on"];
        };
        body: {
          /** last_visited */
          last_visited?: definitions["last_visited"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
  };
  "/shortcuts": {
    get: {
      parameters: {
        query: {
          user_id?: parameters["rowFilter.shortcuts.user_id"];
          alias?: parameters["rowFilter.shortcuts.alias"];
          url?: parameters["rowFilter.shortcuts.url"];
          is_pinned?: parameters["rowFilter.shortcuts.is_pinned"];
          is_prod?: parameters["rowFilter.shortcuts.is_prod"];
          priority?: parameters["rowFilter.shortcuts.priority"];
          /** Filtering Columns */
          select?: parameters["select"];
          /** Ordering */
          order?: parameters["order"];
          /** Limiting and Pagination */
          offset?: parameters["offset"];
          /** Limiting and Pagination */
          limit?: parameters["limit"];
        };
        header: {
          /** Limiting and Pagination */
          Range?: parameters["range"];
          /** Limiting and Pagination */
          "Range-Unit"?: parameters["rangeUnit"];
          /** Preference */
          Prefer?: parameters["preferCount"];
        };
      };
      responses: {
        /** OK */
        200: {
          schema: definitions["shortcuts"][];
        };
        /** Partial Content */
        206: unknown;
      };
    };
    post: {
      parameters: {
        body: {
          /** shortcuts */
          shortcuts?: definitions["shortcuts"];
        };
        query: {
          /** Filtering Columns */
          select?: parameters["select"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** Created */
        201: unknown;
      };
    };
    delete: {
      parameters: {
        query: {
          user_id?: parameters["rowFilter.shortcuts.user_id"];
          alias?: parameters["rowFilter.shortcuts.alias"];
          url?: parameters["rowFilter.shortcuts.url"];
          is_pinned?: parameters["rowFilter.shortcuts.is_pinned"];
          is_prod?: parameters["rowFilter.shortcuts.is_prod"];
          priority?: parameters["rowFilter.shortcuts.priority"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
    patch: {
      parameters: {
        query: {
          user_id?: parameters["rowFilter.shortcuts.user_id"];
          alias?: parameters["rowFilter.shortcuts.alias"];
          url?: parameters["rowFilter.shortcuts.url"];
          is_pinned?: parameters["rowFilter.shortcuts.is_pinned"];
          is_prod?: parameters["rowFilter.shortcuts.is_prod"];
          priority?: parameters["rowFilter.shortcuts.priority"];
        };
        body: {
          /** shortcuts */
          shortcuts?: definitions["shortcuts"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
  };
}

export interface definitions {
  auth: {
    is_2fa_enabled: boolean;
    totp_secret_key: string;
    totp_auth_url: string;
    /**
     * Note:
     * This is a Primary Key.<pk/>
     */
    user_id: string;
    /**
     * Note:
     * This is a Primary Key.<pk/>
     */
    is_prod: boolean;
  };
  bypass_sites: {
    /**
     * Note:
     * This is a Primary Key.<pk/>
     */
    user_id: string;
    /**
     * Note:
     * This is a Primary Key.<pk/>
     */
    is_prod: boolean;
    hostname: string;
    /**
     * Note:
     * This is a Primary Key.<pk/>
     */
    name: string;
  };
  last_visited: {
    /**
     * Note:
     * This is a Primary Key.<pk/>
     */
    user_id: string;
    /**
     * Note:
     * This is a Primary Key.<pk/>
     */
    is_prod: boolean;
    /**
     * Note:
     * This is a Primary Key.<pk/>
     */
    hostname: string;
    visited_on: string;
  };
  shortcuts: {
    /**
     * Note:
     * This is a Primary Key.<pk/>
     */
    user_id: string;
    /**
     * Note:
     * This is a Primary Key.<pk/>
     */
    alias: string;
    url: string;
    is_pinned: boolean;
    /**
     * Note:
     * This is a Primary Key.<pk/>
     */
    is_prod: boolean;
    priority: number;
  };
}

export interface parameters {
  /** Preference */
  preferParams: "params=single-object";
  /** Preference */
  preferReturn: "return=representation" | "return=minimal" | "return=none";
  /** Preference */
  preferCount: "count=none";
  /** Filtering Columns */
  select: string;
  /** On Conflict */
  on_conflict: string;
  /** Ordering */
  order: string;
  /** Limiting and Pagination */
  range: string;
  /** Limiting and Pagination */
  rangeUnit: string;
  /** Limiting and Pagination */
  offset: string;
  /** Limiting and Pagination */
  limit: string;
  /** auth */
  "body.auth": definitions["auth"];
  "rowFilter.auth.is_2fa_enabled": string;
  "rowFilter.auth.totp_secret_key": string;
  "rowFilter.auth.totp_auth_url": string;
  "rowFilter.auth.user_id": string;
  "rowFilter.auth.is_prod": string;
  /** bypass_sites */
  "body.bypass_sites": definitions["bypass_sites"];
  "rowFilter.bypass_sites.user_id": string;
  "rowFilter.bypass_sites.is_prod": string;
  "rowFilter.bypass_sites.hostname": string;
  "rowFilter.bypass_sites.name": string;
  /** last_visited */
  "body.last_visited": definitions["last_visited"];
  "rowFilter.last_visited.user_id": string;
  "rowFilter.last_visited.is_prod": string;
  "rowFilter.last_visited.hostname": string;
  "rowFilter.last_visited.visited_on": string;
  /** shortcuts */
  "body.shortcuts": definitions["shortcuts"];
  "rowFilter.shortcuts.user_id": string;
  "rowFilter.shortcuts.alias": string;
  "rowFilter.shortcuts.url": string;
  "rowFilter.shortcuts.is_pinned": string;
  "rowFilter.shortcuts.is_prod": string;
  "rowFilter.shortcuts.priority": string;
}

export interface operations {}

export interface external {}
