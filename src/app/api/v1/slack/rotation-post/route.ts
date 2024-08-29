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

export async function POST(req: NextRequest) {
  try {
    const parsedPayload = await parsePayloadFromRequest(req);
    console.log('Parsed payload:', parsedPayload);

    // Destructure necessary values from the payload
    const { text, team_domain, channel_id } = parsedPayload;

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

    // Initialize the database client
    const DbClient = new PostgresClient(organizationName, rotationName);

    // Insert the new users into the database
    await DbClient.putItems<SlackUser>(newUsers, TableName.Users);

    await DbClient.createLogsTableIfNotExists();

    return NextResponse.json(
      getSlackMessage(SlackResponseType.InChannel, `Successfully created the ${rotationName} rotation.`)
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Failed to process the request' }, { status: 500 });
  }
}
