import { PostgresClient } from 'utils/database';
import { NextRequest, NextResponse } from 'next/server';
import {
    getSlackMessage,
    SlackResponseType,
    sanitizeSlackText,
    parsePayloadFromRequest,
} from 'utils/slack';

export async function POST(req: NextRequest) {
    try {
        const parsedPayload = await parsePayloadFromRequest(req);
        const { text, team_domain } = parsedPayload;

        const command: string = text.replace(/<[^>]+>/g, '');
        const organizationName = sanitizeSlackText(team_domain);
        const rotationName = sanitizeSlackText(command);
        const holidayChange = sanitizeSlackText(command);// get the slack id from the command after rotation name

        if (!rotationName) {
            return NextResponse.json({ error: 'rotationName is required' }, { status: 400 });
        }

        if (!holidayChange) {
            return NextResponse.json({ error: 'Slack user must be provided' }, { status: 400 });
        }  

        const DbClient = new PostgresClient(organizationName, rotationName);
        const user = await DbClient.toggleHolidayStatus('U07EYLR7B63');

        const slackMessage = getSlackMessage(
            SlackResponseType.InChannel,
            `${rotationName}: <@${user.slack_id}> holiday status is set to: ${user.on_holiday}.`
        );

        console.debug(user);
        return NextResponse.json(slackMessage, { status: 200 });

    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            getSlackMessage(SlackResponseType.Ephemeral, 'Something went wrong, please try again.'),
            { status: 500 }
        );
    }
}
