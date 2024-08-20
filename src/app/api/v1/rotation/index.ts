import type { NextApiRequest, NextApiResponse } from "next";
import { logRequest, returnInvalidRequest } from "utils/server-helper";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {

  logRequest(req)


  switch (req.method) {
    case "POST":
      // TODO: add the handler for creating a rotation instead of this.
      returnInvalidRequest(res)
      break;

    case "GET":
      //TODO: add a handler for returning the current rotations for this user.
      returnInvalidRequest(res)
      break;

    default:
      returnInvalidRequest(res)
      break;
  }
}

