import { PostgresClient, TableName } from 'utils/database';
import { SlackUser } from 'types';
import { NextRequest, NextResponse } from 'next/server';
import {
  SlackResponseType,
  getSlackMessage,
  getSlackUsersFromChannel,
  parsePayloadFromRequest,
  sanitizeSlackText,
} from 'utils/slack';
import { createLog } from 'utils/logic';

export async function POST(req: NextRequest) {
  try {
    const parsedPayload = await parsePayloadFromRequest(req);
    console.log('Parsed payload:', parsedPayload);

    // Destructure necessary values from the payload
    const { text, team_domain, channel_id, user_name } = parsedPayload;

    // Clean up the command text
    const command: string = text.replace(/<[^>]+>/g, '');
    console.log('Command cleaned:', command);

    // Sanitize and prepare values for database operations
    const organizationName = sanitizeSlackText(team_domain);
    const rotationName = sanitizeSlackText(command);
    const channelId = channel_id.trim();

    // Get the users from the Slack channel
    const newUsers = await getSlackUsersFromChannel(channelId);
    console.debug(`New users fetched: ${JSON.stringify(newUsers, null, ' ')}`);

    // Validate rotation name
    if (!rotationName || typeof rotationName !== 'string') {
      console.error('Invalid rotationName:', rotationName);
      return NextResponse.json({ error: 'rotationName is required' }, { status: 400 });
    }

    const DbClient = new PostgresClient(organizationName, rotationName);

    await DbClient.putItems<SlackUser>(newUsers, TableName.Users);

    await DbClient.createLogsTableIfNotExists();

    const logEntry = createLog(
      `Created ${rotationName} task`,
      sanitizeSlackText(user_name),
      'status'
    );

    console.log('Created Log Entry:', logEntry); // Debugging log

    await DbClient.insertLog(organizationName, rotationName, logEntry);

    return NextResponse.json(
      getSlackMessage(SlackResponseType.InChannel, `Successfully created the ${rotationName} rotation.`)
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Failed to process the request' }, { status: 500 });
  }
}
