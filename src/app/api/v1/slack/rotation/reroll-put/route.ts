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
      return NextResponse.json({ error: 'rotationName is required' }, { status: 400 });
    }

    const DbClient = new PostgresClient(organizationName, rotationName);
    const { rows } = await DbClient.queryUsersForOrganizationAndRotation(organizationName, rotationName, true);

    const lastOnDuty = rows.find(user => user.on_backup === true);
    const restartOnDuty = rows.find(user => user.on_duty === true);

    if (restartOnDuty) {
      restartOnDuty.on_duty = false;
      restartOnDuty.count -= 1;
    }

    if (lastOnDuty) {
      lastOnDuty.on_backup = false;
      lastOnDuty.on_duty = true;
    }

    console.log(rows);

    const usersNotOnDuty = filterUserOnDuty(rows);
    const filteredUsers = filterSlackUsers(usersNotOnDuty);

    const userOnDuty: SlackUser = selectSlackUser(filteredUsers);

    const users = await DbClient.rotateUsers(
      userOnDuty.slack_id,
      lastOnDuty?.slack_id,
      restartOnDuty?.slack_id
    );

    const slackMessage = getSlackMessage(
      SlackResponseType.InChannel,
      `${rotationName}: <@${userOnDuty.slack_id}> is on duty, and <@${lastOnDuty?.slack_id}> will back them up.`
    );

    const logEntry = createLog(
      `Rerolled ${userOnDuty.full_name} to on duty and ${lastOnDuty?.full_name} as backup`,
      sanitizeSlackText(user_name),
      'rotation'
    );

    const log = await DbClient.insertLog(organizationName, rotationName, logEntry);

    console.debug(log);
    console.debug(users);
    return NextResponse.json(slackMessage, { status: 200 });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      getSlackMessage(SlackResponseType.Ephemeral, 'Something went wrong, please try again.'),
      { status: 500 }
    );
  }
}
