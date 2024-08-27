import { PostgresClient } from 'utils/database';
import { NextRequest, NextResponse } from 'next/server';
import {
    getSlackMessage,
    SlackResponseType,
    sanitizeSlackText,
    parsePayloadFromRequest,
} from 'utils/slack';

export async function PUT(req: NextRequest) {
    try {
        const parsedPayload = await parsePayloadFromRequest(req);
        const { text, team_domain } = parsedPayload;
        const slackIdMatch = text.match(/<@([A-Z0-9]+)>/);
        const slackId = slackIdMatch ? slackIdMatch[1] : null;
        const rotationName = sanitizeSlackText(text.replace(/<@[^>]+>/g, '').trim());

        if (!rotationName) {
            const message = 'Error: task name is required.\n' +
                'Usage example: /rr-skip task-name @user';
            return NextResponse.json(
                getSlackMessage(SlackResponseType.Ephemeral, message),
                { status: 400 }
            );
        }

        if (!slackId) {
            const message = 'Error: User is required.\n' +
                'Usage example: /rr-skip task-name @user';
            return NextResponse.json(
                getSlackMessage(SlackResponseType.Ephemeral, message),
                { status: 400 }
            );
        }

        const organizationName = sanitizeSlackText(team_domain);
        const DbClient = new PostgresClient(organizationName, rotationName);

        // Ensure slackId is not null before passing it to the function
        if (!slackId) {
            return NextResponse.json(
                getSlackMessage(SlackResponseType.Ephemeral, 'Invalid  user.'),
                { status: 400 }
            );
        }

        const user = await DbClient.toggleHolidayStatus(slackId);

        if (!user) {
            return NextResponse.json(
                getSlackMessage(SlackResponseType.Ephemeral, `<@${slackId}> user not found or invalid.`),
                { status: 404 }
            );
        }

        const slackMessage = getSlackMessage(
            SlackResponseType.InChannel,
            `${rotationName}; <@${user.slack_id}> ${user.on_holiday ? 'won\'t' : 'will'} be available for selection.`
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
