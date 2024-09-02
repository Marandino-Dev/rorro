import { NextApiResponse } from 'next';
import { NextRequest } from 'next/server';

export function returnInvalidRequest(res: NextApiResponse) {
  return res.status(400).json({ message: 'Invalid Request' });
}

export function logRequest(req: NextRequest) {

  console.debug(`API Request: ${req.method} ${req.url}`);
  console.debug('Headers:', req.headers);
  console.debug('Body:', req.body);

}
