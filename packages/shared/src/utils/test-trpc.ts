import {
  type BrowserContext,
  type Request,
  type Route,
} from '@playwright/test';

const TRPC_PATH = '/api/trpc/';

/** Ordered, since a response entry is matched to its call by index. */
const getBatchedProcedures = (url: string) => {
  const { pathname } = new URL(url);
  const names = pathname.slice(pathname.indexOf(TRPC_PATH) + TRPC_PATH.length);
  return names ? decodeURIComponent(names).split(',') : [];
};

const isBatched = (route: Route) =>
  getBatchedProcedures(route.request().url()).length > 1;

/** Inputs are keyed by batch index in both the query string and the post body. */
const getInput = (request: Request, index: number) => {
  const raw =
    request.postData() ?? new URL(request.url()).searchParams.get('input');
  if (!raw) {
    return undefined;
  }
  return (JSON.parse(raw) as Record<string, unknown>)[String(index)];
};

export interface ProcedureCall {
  route: Route;
  input: unknown;
  /** Position in the batch, so one procedure can be answered on its own. */
  index: number;
}

/** `handle` must answer or `route.fallback()`; the returned reader exposes the inputs seen. */
export const routeTrpcProcedure = async (
  context: BrowserContext,
  procedure: string,
  handle: (call: ProcedureCall) => Promise<void>
) => {
  const inputs: unknown[] = [];
  await context.route('**/api/trpc/**', async (route) => {
    const index = getBatchedProcedures(route.request().url()).indexOf(
      procedure
    );
    if (index < 0) {
      await route.fallback();
      return;
    }
    const input = getInput(route.request(), index);
    inputs.push(input);
    await handle({ route, input, index });
  });
  return () => inputs;
};

/** tRPC pairs responses by index, so the batch's other procedures keep their real answers. */
const answerProcedure = async (
  { route, index }: ProcedureCall,
  entry: unknown
) => {
  const body: unknown[] = [];
  if (isBatched(route)) {
    // Replaying would send the batch's writes to the real account for real
    if (route.request().method() !== 'GET') {
      throw new Error('Refusing to replay a batched mutation upstream');
    }
    const upstream = await route.fetch();
    if (!upstream.ok()) {
      await route.fulfill({ response: upstream });
      return;
    }
    body.push(...((await upstream.json()) as unknown[]));
  }
  body[index] = entry;
  await route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
};

export const succeedProcedure = async (call: ProcedureCall, data: unknown) =>
  answerProcedure(call, { result: { data } });

/** A batched query fails per index; anything else fails at the request boundary. */
export const failProcedure = async (call: ProcedureCall) => {
  if (!isBatched(call.route) || call.route.request().method() !== 'GET') {
    await call.route.abort();
    return;
  }
  await answerProcedure(call, {
    error: {
      message: 'Injected failure',
      code: -32603,
      data: { code: 'INTERNAL_SERVER_ERROR', httpStatus: 500 },
    },
  });
};
