import { PostgresClient, TableName } from "utils/database";
import { SlackCommandRequest, SlackUser } from "types";
import { NextRequest, NextResponse } from "next/server";
import {
  getSlackMessage,
  getSlackUsersFromChannel,
  SlackResponseType,
  sanitizeSlackText,
  parsePayloadFromRequest
} from "utils/slack";

export async function POST(
  req: NextRequest
) {

  const parsedPayload = await parsePayloadFromRequest(req);

  //TODO: add proper types
  const { text, team_domain, channel_id } = parsedPayload
  console.log(parsedPayload)

  const command: string = text.replace(/<[^>]+>/g, ''); //cleanup the command

  const organizationName = sanitizeSlackText(team_domain)
  const rotationName = sanitizeSlackText(command)
  const channelId = channel_id.trim(); //this data needs to be uppercase just as slack sends it to us.

  const newUsers = await getSlackUsersFromChannel(channelId)
  console.debug(`These are the new users that have been created: ${JSON.stringify(newUsers, null, ' ')}`)

  if (!rotationName || typeof rotationName !== 'string') {
    return NextResponse.json({ error: 'rotationName is required' }, { status: 400 })
  }

  const DbClient = new PostgresClient(organizationName, rotationName);

  const users = await DbClient.putItems<SlackUser>(
    newUsers, TableName.Users
  );

  console.debug(users)

  return NextResponse.json(
    getSlackMessage(
      SlackResponseType.InChannel,
      `Successfully created the ${rotationName} rotation.`
    )
  )
}

