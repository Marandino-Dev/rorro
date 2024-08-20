import { PostgresClient, TableName } from "utils/database";
import { SlackUser } from "types";
import { NextRequest, NextResponse } from "next/server";

type SlackCommandPayload = {
  /** The Request Token from Slack */
  token: string;
  team_id: string;
  /** The Unique string that Slack uses for the organization */
  team_domain: string;
  enterprise_id: string;
  enterprise_name: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  /** The user name who invoked this */
  user_name: string;
  /** The exact command the user invoked, e.g: /rr*/
  command: string;
  /** The text after the command, usually the optional parameters */
  text: string;
  response_url: string;
  trigger_id: string;
  api_app_id: string;
}


interface SlackCommandRequest {
  body?: SlackCommandPayload
}

/** Returns the input from the user, without spaces so the table doesn't break */
function sanitizeSlackText(text: string) {
  return text.trim().replaceAll(" ", "_")
}

export async function POST(
  req: NextRequest & SlackCommandRequest,
) {

  console.debug(req)
  const { body } = req;
  const organizationName = sanitizeSlackText(body.team_domain);
  const rotationName = sanitizeSlackText(body.text)

  // TODO: use the data that we gathered, to retrieve all the users on that slack channel this command was executed at.

  if (!rotationName || typeof rotationName !== 'string') return NextResponse.json({ error: 'rotationName is required' }, { status: 400 })

  // TODO: fetch the users in the channel this was created on.

  const DbClient = new PostgresClient(organizationName, rotationName)// TODO: softcode organization

  const users = await DbClient.putItem<SlackUser>(
    {
      slackId: body.user_id,
      fullName: body.user_name,
      count: 0, // TODO: get an average if the rotation already exists
      holiday: false,
      onDuty: false,
      backup: false
    }, TableName.Users);

  console.log(users)
  return NextResponse.json({ users }, { status: 200 })

}

