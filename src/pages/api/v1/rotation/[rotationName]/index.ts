import type { NextApiRequest, NextApiResponse } from "next";
import { logRequest, returnInvalidRequest } from "utils/server-helper";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {

  logRequest(req)


  switch (req.method) {
    case "POST":
      // TODO: add the handler so this can rotate the user.
      returnInvalidRequest(res)
      break;

    case "GET":
      //TODO: return the current active and backup users.
      returnInvalidRequest(res)
      break;

    default:
      returnInvalidRequest(res)
      break;
  }
}

