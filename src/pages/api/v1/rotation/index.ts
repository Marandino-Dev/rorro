import { PostgresClient, TableName } from "utils/database";
import { logRequest, returnInvalidRequest } from "utils/server-helper";

import type { NextApiRequest, NextApiResponse } from "next";

import { getSlackMessage, SlackResponseType } from "utils/slack";

async function getCurrentRotations(res: NextApiResponse, rotationName: string) {
  try {
    const DbClient = new PostgresClient('marandino', rotationName);
    //Todo change any for rotation in the future
    //const lastLog = await DbClient.queryLatestLog<any>(TableName.Logs);
    const lastLog = await DbClient.queryLatestLog<any>(TableName.Logs);
    `Slack user on duty: <@${lastLog.current_deployer}> | Backup Slack user: <@${lastLog.backup_deployer}>.`;
    if (!lastLog) {
      const errorMessage = getSlackMessage(SlackResponseType.Ephemeral, 'No logs found');
      return res.status(404).json(errorMessage);
    }

    const slackMessage = getSlackMessage(
      SlackResponseType.Ephemeral,
      `Slack user on duty: <@${lastLog}> | Backup Slack user: <@${lastLog}>.`
    );

    return res.status(200).json(slackMessage);
  } catch (error) {
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

  const { rotationName } = req.query;
  if (!rotationName || typeof rotationName !== 'string') {
    return res.status(400).json({ error: 'Rotation name is required' });
  }

  logRequest(req);


  switch (req.method) {
    case "POST":
      // TODO: add the handler for creating a rotation instead of this.
      returnInvalidRequest(res);
      break;

    case "GET":
      await getCurrentRotations(res, rotationName);
      break;

    default:
      returnInvalidRequest(res);
      break;
  }
}

