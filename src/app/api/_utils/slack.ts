import type { NextRequest } from "next/server";
import { SlackUser, SlackCommandPayload } from "types"

/** Slack Response Type in order to choose what type of display the return message will have */
export enum SlackResponseType {
  /** Used to return a message in the same channel the command was executed. Everyone can see it */
  InChannel = 'in_channel',
  /** Used to return a temporary message that only the user will be able to see */
  Ephemeral = 'ephemeral',
  // not much info about this one yet, haven't tried it.
  Modal = 'trigger_id',
}
export function getSlackMessage(responseType: SlackResponseType, responseText: string) {

  //TODO: expand upon this, make it be able to use different types of response.
  // https://api.slack.com/interactivity/handling#responses
  return {
    response_type: responseType,
    text: responseText,
  }

}


export async function getSlackUsersFromChannel(channel: string): Promise<SlackUser[]> {
  //testing <@U07F36MJVFH|dcruz> <!here> <!subteam^S07JMHLTDHN|@backend>
  // const regex = /<!subteam\^([^|]+)/;
  // const userGroupId = text.match(regex)?.[1]
  //

  //TODO: make it accept an user group
  if (!channel) return []

  const token = process.env.SLACK_TEST_TOKEN;
  // const res = await fetch('https://slack.com/api/usergroups.users.list?usergroup=' + userGroupId,
  const res = await fetch('https://slack.com/api/conversations.members?channel=' + channel,
    {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,//TODO: we need to take the token we stored upon installation, not this one.
      },
    }
  )

  const responseData = await res.json()// this should be able to return just that. slackId[]
  const { members: slackUserIds } = responseData;

  console.debug(slackUserIds)
  if (slackUserIds?.length < 0) return []
  return slackUserIds.map((slackId: string) => createUser(slackId));
}

function createUser(slackId: string): SlackUser {
  const user: SlackUser = {
    slackId,
    fullName: '', //TODO: add the fullname.
    count: 0,
    onDuty: false,
    backup: false,
    holiday: false,
  }
  console.debug('The user has been created for: ', slackId)
  return user
}


/** Returns the input from the user, without spaces so the table doesn't break */
export function sanitizeSlackText(text: string) {
  console.debug("I'm sanitizing the following text:", text)
  return text.trim().toLowerCase().replaceAll(" ", "_").replaceAll('-', '_')
}

export async function parsePayloadFromRequest(req: NextRequest): Promise<SlackCommandPayload> {
  const contentType = req.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    // Handle JSON data
    return await req.json() as SlackCommandPayload
  }
  if (contentType?.includes('multipart/form-data') || contentType?.includes('application/x-www-form-urlencoded')) {
    // Handle form data
    const formData = await req.formData();
    return Object.fromEntries(formData) as SlackCommandPayload
  }

  throw new Error('We failed to parse the command with contentType: ' + contentType)
}

