import { PostgresClient } from 'utils/database';
import { NextRequest, NextResponse } from 'next/server';
import {
  SlackResponseType,
  getSlackMessage,
  parsePayloadFromRequest,
  sanitizeSlackText,
} from 'utils/slack';
import {
  createLog,
  filterSlackUsers,
  filterUserOnDuty,
  selectSlackUser,
} from 'utils/logic';
import { SlackUser } from 'types';

export async function POST(req: NextRequest) {
  try {
    const parsedPayload = await parsePayloadFromRequest(req);
    const { text, team_domain, user_name } = parsedPayload;

    const command: string = text.replace(/<[^>]+>/g, '');
    const organizationName = sanitizeSlackText(team_domain);
    const rotationName = sanitizeSlackText(command);

    if (!rotationName) {
      return NextResponse.json({ error: 'rotationName is required' }, { status: 200 });
    }

    const DbClient = new PostgresClient(organizationName, rotationName);
    const { rows } = await DbClient.queryUsersForOrganizationAndRotation(organizationName, rotationName, true);

    const previousBackup = rows.find(user => user.on_backup === true)?.slack_id;
    const newBackup = rows.find(user => user.on_duty === true);

    const usersNotOnDuty = filterUserOnDuty(rows);
    const filteredUsers = filterSlackUsers(usersNotOnDuty);

    const userOnDuty: SlackUser = selectSlackUser(filteredUsers);

    await DbClient.rotateUsers(
      userOnDuty.slack_id,
      newBackup?.slack_id,
      previousBackup
    );

    const slackMessage = getSlackMessage(
      SlackResponseType.InChannel,
      `${rotationName}: <@${userOnDuty.slack_id}> is on duty, and <@${newBackup?.slack_id}> will back them up.`
    );

    // Create a log entry
    const logEntry = createLog(
      `Changed ${userOnDuty.full_name} to on duty and ${newBackup?.full_name} as backup`,
      sanitizeSlackText(user_name),
      'rotation'
    );

    await DbClient.insertLog(logEntry);

    return NextResponse.json(slackMessage, { status: 200 });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      getSlackMessage(SlackResponseType.Ephemeral, 'Something went wrong, please try again.'),
      { status: 500 }
    );
  }
}
