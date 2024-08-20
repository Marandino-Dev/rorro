import { NextApiResponse, NextApiRequest } from "next";

export function returnInvalidRequest(res: NextApiResponse) {
  return res.status(400).json({ message: "Invalid Request" })
}

export function logRequest(req: NextApiRequest) {

  console.debug(`API Request: ${req.method} ${req.url}`);
  console.debug('Headers:', req.headers);
  console.debug('Query:', req.query);
  console.debug('Body:', req.body);

}
