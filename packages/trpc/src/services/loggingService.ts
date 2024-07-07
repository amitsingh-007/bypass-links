import { Axiom } from '@axiomhq/js';
import { getEnv } from '../constants/env';
import { axiomDataset, ILogData, ILogRequest } from '../constants/logs';

const getAxiomClient = () => {
  const { AXIOM_TOKEN, AXIOM_ORG_ID } = getEnv();
  return new Axiom({
    token: AXIOM_TOKEN,
    orgId: AXIOM_ORG_ID,
  });
};

export const logToAxiom = async (
  logReq: ILogRequest,
  reqMetaData: {
    userAgent?: string;
    ip: string | null;
  }
) => {
  const { isProd, ...logData } = logReq;
  const data: ILogData = {
    ...logData,
    env: isProd ? 'production' : 'development',
    req: reqMetaData,
  };
  if (data.env === 'production') {
    await getAxiomClient().ingestEvents(axiomDataset, data);
  }
};
