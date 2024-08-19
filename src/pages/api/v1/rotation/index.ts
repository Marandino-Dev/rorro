import type { NextApiRequest, NextApiResponse } from "next";
import { logRequest, returnInvalidRequest } from "utils/server-helper";
import { getSlackMessage, SlackResponseType } from "utils/slack";
import { sql } from "@vercel/postgres";

async function getCurrentRotations(res: NextApiResponse) {
  try {
    const { rows: logs } = await sql`SELECT * FROM marandino_standup_logs ORDER BY date DESC LIMIT 1`;

    if (!logs || logs.length === 0) {
      const errorMessage = getSlackMessage(SlackResponseType.Ephemeral, 'No logs found');
      return res.status(404).json(errorMessage);
    }

    const lastLog = logs[0];

    const slackMessage = getSlackMessage(
      SlackResponseType.Ephemeral,
      `Slack user on duty: <@${lastLog.current_deployer}> | Backup Slack user: <@${lastLog.backup_deployer}>.`
    );

    return res.status(200).json(slackMessage);
  }
  catch (error) {
    console.error(JSON.stringify(error));
    const slackMessage = getSlackMessage(
      SlackResponseType.Ephemeral, 'Something went wrong, please try again.'
    );
    return res.status(500).json(slackMessage);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {

  logRequest(req);


  switch (req.method) {
    case "POST":
      // TODO: add the handler for creating a rotation instead of this.
      returnInvalidRequest(res);
      break;

    case "GET":
      //TODO: add a handler for returning the current rotations for this user.
      await getCurrentRotations(res);
      break;

    default:
      returnInvalidRequest(res);
      break;
  }
}

