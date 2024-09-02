import {
  SlackResponseType,
  getSlackMessage,
  parsePayloadFromRequest,
  sanitizeSlackText,
} from 'utils/slack';
import { NextRequest, NextResponse } from 'next/server';
import { PostgresClient } from 'utils/database';
import { createLog } from 'utils/logic';

export async function POST(req: NextRequest) {
  try {
    const parsedPayload = await parsePayloadFromRequest(req);
    const { text, team_domain, user_name } = parsedPayload;
    const slackIdMatch = text.match(/<@([A-Z0-9]+)\|[^>]+>/);

    // TODO: add multiple users support
    const slackId = slackIdMatch ? slackIdMatch[1] : null;
    const rotationName = sanitizeSlackText(
      text.replace(/<@[^>]+>/g, '').trim()
    );

    if (!slackId || !rotationName) {
      const message =
        'Error: User and Task are required. Usage example: /rr-skip task-name @user';
      return NextResponse.json(
        getSlackMessage(SlackResponseType.Ephemeral, message),
      );
    }

    const organizationName = sanitizeSlackText(team_domain);
    const DbClient = new PostgresClient(organizationName, rotationName);
    const user = await DbClient.toggleHolidayStatus(slackId);

    if (!user) {
      return NextResponse.json(
        getSlackMessage(
          SlackResponseType.Ephemeral,
          `<@${slackId}> user not found or invalid.`
        ),
      );
    }

    const slackMessage = getSlackMessage(
      SlackResponseType.InChannel,
      `${rotationName.replace(/_/g, ' ')}; <@${user.slack_id}> ${
        user.on_holiday ? 'won\'t' : 'will'
      } be available for selection.`
    );

    // Create a log entry
    const logEntry = createLog(
      `Changed ${user.full_name} ${user.on_holiday ? 'to on holiday' : 'back to work'}.`,
      sanitizeSlackText(user_name),
      'status'
    );

    // Insert the log entry into the database
    const log = await DbClient.insertLog(organizationName, rotationName, logEntry);

    console.debug(log);
    return NextResponse.json(slackMessage);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      getSlackMessage(
        SlackResponseType.Ephemeral,
        'Something went wrong, please try again.'
      )
    );
  }
}
