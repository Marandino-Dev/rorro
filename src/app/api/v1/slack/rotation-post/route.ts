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
import { createLog } from 'utils/logic';

export async function POST(req: NextRequest) {
  try {
    const parsedPayload = await parsePayloadFromRequest(req);

    // Destructure necessary values from the payload
    const { text, team_domain, channel_id, user_name, team_id } = parsedPayload;

    // Clean up the command text
    const command: string = text.replace(/<[^>]+>/g, '');

    // Extract the userGroup ID if present
    const userGroupMatch = text.match(/<!subteam\^([A-Z0-9]+)\|/);
    const userGroup = userGroupMatch ? userGroupMatch[1] : null;
    // Sanitize and prepare values for database operations
    const organizationName = sanitizeSlackText(team_domain);
    const rotationName = sanitizeSlackText(command);
    const channelId = channel_id.trim();

    // Validate rotation name
    if (!rotationName || typeof rotationName !== 'string') {
      console.error('Invalid rotationName:', rotationName);
      return NextResponse.json({ error: 'rotationName is required' });
    }

    // Get the users from the Slack channel
    const newUsers = userGroup ? await getSlackUsersFromUserGroup(userGroup, team_id) : await getSlackUsersFromChannel(channelId, team_id);

    if (newUsers?.length === 0) {
      return NextResponse.json(
        getSlackMessage(SlackResponseType.Ephemeral, 'Could not find any users, if this is a private channel add an @userGroup')
      );
    }

    console.debug(`New users fetched: ${JSON.stringify(newUsers, null, ' ')}`);

    const DbClient = new PostgresClient(organizationName, rotationName);

    await DbClient.putItems<SlackUser>(newUsers, TableName.Users);

    await DbClient.createLogsTableIfNotExists();

    const logEntry = createLog(
      `Created ${rotationName} task`,
      sanitizeSlackText(user_name),
      'status'
    );

    await DbClient.insertLog(organizationName, rotationName, logEntry);

    return NextResponse.json(
      getSlackMessage(SlackResponseType.InChannel, `Successfully created the ${rotationName.replace('_', ' ')} rotation.`)
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Failed to process the request' }, { status: 500 });
  }
}
