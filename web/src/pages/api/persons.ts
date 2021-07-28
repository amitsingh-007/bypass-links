import { IPerson } from "@common/interfaces/person";
import { getPersons } from "@database/persons";
import { updatePersons } from "@logic/persons";
import withAuth from "@middlewares/withAuth";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API to get and save persons
 */
const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const uid = req.query.uid as string;
  if (req.method === "GET") {
    res.json({ persons: await getPersons(uid) });
  } else if (req.method === "POST") {
    const { persons }: { persons: Omit<IPerson, "taggedUrls">[] | null } =
      JSON.parse(req.body);
    res.json({
      isSuccess: Boolean(persons && (await updatePersons(uid, persons))),
    });
  }
};

export default withAuth(handler);
