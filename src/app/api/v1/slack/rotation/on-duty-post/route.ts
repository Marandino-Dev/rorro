import { PostgresClient } from 'utils/database';
import { NextRequest, NextResponse } from 'next/server';
import {
    getSlackMessage,
    SlackResponseType,
    sanitizeSlackText,
    parsePayloadFromRequest,
} from 'utils/slack';
import {
    filterUserOnDuty,
    filterSlackUsers,
    selectSlackUser
} from 'utils/logic';
import { SlackUser } from 'types';

export async function POST(req: NextRequest) {
    try {
        const parsedPayload = await parsePayloadFromRequest(req);
        const { text, team_domain } = parsedPayload;

        const command: string = text.replace(/<[^>]+>/g, '');
        const organizationName = sanitizeSlackText(team_domain);
        const rotationName = sanitizeSlackText(command);

        if (!rotationName) {
            return NextResponse.json({ error: 'rotationName is required' }, { status: 400 });
        }

        const DbClient = new PostgresClient(organizationName, rotationName);
        const { rows } = await DbClient.queryUsersForOrganizationAndRotation(organizationName, rotationName);

        const previousBackup = rows.find(user => user.on_backup === true)?.slack_id;
        const newBackup = rows.find(user => user.on_duty === true)?.slack_id;

        const usersNotOnDuty = filterUserOnDuty(rows);
        const filteredUsers = filterSlackUsers(usersNotOnDuty);

        const userOnDuty: SlackUser = selectSlackUser(filteredUsers);

        const users = await DbClient.rotateUsers(
            userOnDuty.slack_id,
            newBackup,
            previousBackup
        );

        const slackMessage = getSlackMessage(
            SlackResponseType.InChannel,
            `${rotationName}: <@${userOnDuty.slack_id}> is on duty, and <@${newBackup}> will back them up.`
        );

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
