import { PostgresClient, TableName } from 'utils/database';
import { SlackUser } from 'types';
import { NextRequest, NextResponse } from 'next/server';
import {
  SlackResponseType,
  getSlackMessage,
  getSlackUsersFromChannel,
  getSlackUsersFromUserGroup,
  parsePayloadFromRequest,
  sanitizeSlackText,
} from 'utils/slack';
import { createLog, filterCurrentUser, filterSlackUsers, filterUserOnDuty, selectSlackUser } from '@/app/api/_utils/logic';

// TODO: refactor this into it's own function inside the slack utils.
const sendResponseMessage = async (responseUrl: string, message: string) => {
  const response = {
    response_type: SlackResponseType.InChannel,
    text: message,
  };
  await fetch(responseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(response),
  });

  console.debug('Response sent to', responseUrl);
};

// TODO: refactor all this...
export async function POST(req: NextRequest) {
  try {
    const parsedPayload = await parsePayloadFromRequest(req);

    // Destructure necessary values from the payload
    const { text, team_domain, channel_id, team_id, user_name, user_id, response_url } = parsedPayload;

    // Clean up the command text
    const command: string = text.replace(/<[^>]+>/g, '');

    // Extract the userGroup ID if present
    const userGroupMatch = text.match(/<!subteam\^([A-Z0-9]+)\|/);
    const userGroup = userGroupMatch ? userGroupMatch[1] : null;

    const inputUrlMatch = text.match(/<https:.*?>/);
    const inputUrl = inputUrlMatch ? inputUrlMatch[0] : null;

    if (inputUrl) {
      console.log('This command has an url', inputUrl);
    }

    // Sanitize and prepare values for database operations
    const organizationName = sanitizeSlackText(team_domain);
    const rotationName = sanitizeSlackText(command);
    const channelId = channel_id.trim();

    // for any of the errors use the trigger_id to create a modal and request them to create a pick selection

    // Validate rotation name
    if (!rotationName || typeof rotationName !== 'string') {
      console.error('Invalid rotationName:', rotationName);
      return NextResponse.json(
        getSlackMessage(SlackResponseType.Ephemeral, 'a name for the task to pick is required')
      );
    }

    const DbClient = new PostgresClient(organizationName, rotationName);
    const taskExists = await DbClient.confirmTaskExists();

    if (!taskExists) {
      console.log('I should be creating a task');

      // Get the users from the Slack channel or the userGroup if it was passed
      const newUsers = userGroup ?
        await getSlackUsersFromUserGroup(userGroup, team_id):
        await getSlackUsersFromChannel(channelId, team_id);

      if (!newUsers || newUsers.length === 0) {
        console.error('No users found:', newUsers);
        return NextResponse.json(
          getSlackMessage(SlackResponseType.Ephemeral, 'Could not retrieve any of the users, if this is a private channel add an @userGroup or invite Rorro to the channel.')
        );
      }
      await DbClient.putItems<SlackUser>(newUsers, TableName.Users);

      await DbClient.createLogsTableIfNotExists();

      const logEntry = createLog(
        `Created ${rotationName} task`,
        sanitizeSlackText(user_name || user_id),
        'status'
      );
      await DbClient.insertLog(logEntry);
    }

    const { rows } = await DbClient.queryUsersForOrganizationAndRotation(organizationName, rotationName, true);

    const previousBackup = rows.find(user => user.on_backup === true)?.slack_id;
    const newBackup = rows.find(user => user.on_duty === true);

    const notCurrentUser = filterCurrentUser(user_id, rows);
    const usersNotOnDuty = filterUserOnDuty(notCurrentUser);
    const filtered = filterSlackUsers(usersNotOnDuty);

    const userOnDuty: SlackUser = selectSlackUser(filtered);

    // TODO: refactor everything here...
    await DbClient.rotateUsers(
      userOnDuty.slack_id,
      newBackup?.slack_id,
      previousBackup
    );

    const logEntry = createLog(
      `Picked ${userOnDuty.full_name} for ${rotationName}`,
      sanitizeSlackText(user_name),
      'rotation'
    );

    await DbClient.insertLog(logEntry);

    // sends only one message on slack
    await sendResponseMessage(response_url, `<@${userOnDuty.slack_id}> has been selected for ${rotationName.replace(/_/g, ' ')}${inputUrl ? `: ${inputUrl}` : ''} by <@${user_id}>`);

    // return a 200 to acknowledge the request.
    return new Response(null, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      getSlackMessage(SlackResponseType.Ephemeral, 'error: Processing request' + JSON.stringify(error, null, 2))
    );
  }
}
