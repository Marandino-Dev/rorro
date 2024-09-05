import { type NextRequest } from 'next/server';
import { SlackCommandPayload, SlackUser } from 'types';
import { PostgresClient } from './database';
import { decrypt } from './crypto';

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

  // TODO: expand upon this, make it be able to use different types of response.
  // https://api.slack.com/interactivity/handling#responses
  return {
    response_type: responseType,
    text: responseText,
  };

}

async function fetchSlackApi(slackApiString: string, team_id: string) {
  // Fetch the organization:
  const organization = await PostgresClient.getOrganization(team_id);
  const token = decrypt(organization.access_hash);

  try {
    // const res = await fetch('https://slack.com/api/usergroups.users.list?usergroup=' + userGroupId,
    const res = await fetch('https://slack.com/api/' + slackApiString, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token, // TODO: retrieve the correct token stored upon installation.
      },
    });

    const jsonResponse = await res.json();

    if (jsonResponse.error === 'invalid_auth') {
      throw new Error(`Error fetching from Slack API: ${jsonResponse.error || 'Unknown error'}.\nPlease check if the Slack token is valid. Reinstalling the app might resolve this issue.`);
    }

    if (!res.ok || jsonResponse.error) {
      throw new Error(`Error fetching from Slack API: ${jsonResponse.error || 'Unknown error'}`);
    }

    return jsonResponse;
  } catch (error) {
    console.error(`Failed to fetch from Slack API: ${error}`);
    throw error;
  }
}

export async function getSlackUsersFromChannel(channel: string, team_id: string): Promise<SlackUser[]> {

  // TODO: make it accept an user group
  if (!channel) return [];

  const { members } = await fetchSlackApi(`conversations.members?channel=${channel}`, team_id);

  console.info('These are the members in this channel: ', members);

  if (!members || members.length <= 0) return [];
  const newUsersArray: SlackUser[] = [];

  // create the new users based on that.
  for (let i = 0; i < members.length; i++) {
    const member = members[i];// this should be a slackId
    const { user } = await fetchSlackApi('users.info?user=' + member, team_id);

    const newUser = createUser(member, user?.profile?.real_name_normalized || '');
    newUsersArray.push(newUser);
  }

  return newUsersArray;
}

// TODO refactor this, it's almost the same as the function above.
export async function getSlackUsersFromUserGroup(userGroup: string, team_id: string): Promise<SlackUser[]> {
  if (!userGroup) return [];

  const { users }= await fetchSlackApi(`usergroups.users.list?usergroup=${userGroup}`, team_id);
  console.info('These are the users in this group: ', users);

  if (!users || users.length <= 0) return [];
  const newUsersArray: SlackUser[] = [];

  // create the new users based on that.
  for (let i = 0; i < users.length; i++) {
    const user = users[i];// this should be a slackId
    const { user: userInfo } = await fetchSlackApi('users.info?user=' + user, team_id);

    const newUser = createUser(user, userInfo?.profile?.real_name_normalized || '');
    newUsersArray.push(newUser);
  }

  return newUsersArray;
}

function createUser(slack_id: string, full_name: string): SlackUser {

  // TODO: add an average for users that are added to a rotation mid-way
  const user: SlackUser = {
    slack_id,
    full_name,
    count: 0,
    on_duty: false,
    on_backup: false,
    on_holiday: false,
  };
  console.debug('The user has been created for: ', slack_id);
  return user;
}

/** Returns the input from the user, without spaces so the table doesn't break */
export function sanitizeSlackText(text: string) {
  console.debug('I\'m sanitizing the following text:', text);
  return text.trim().toLowerCase().replaceAll(' ', '_').replaceAll('-', '_');
}

export async function parsePayloadFromRequest(req: NextRequest): Promise<SlackCommandPayload> {
  const contentType = req.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    // Handle JSON data
    return await req.json() as SlackCommandPayload;
  }
  if (contentType?.includes('multipart/form-data') || contentType?.includes('application/x-www-form-urlencoded')) {
    // Handle form data
    const formData = await req.formData();
    // TODO: refactor this to be more readable
    const entries = Array.from(formData.entries()).map(([key, value]) => {
      if (typeof value === 'string') {
        return [key, value.trim()];
      }
      return [key, value];
    });
    return Object.fromEntries(entries) as SlackCommandPayload;
  }

  throw new Error('We failed to parse the command with contentType: ' + contentType);
}

