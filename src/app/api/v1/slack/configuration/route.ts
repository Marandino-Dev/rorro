import { NextRequest, NextResponse } from 'next/server';
import { PostgresClient } from 'utils/database';
import jwt from 'jsonwebtoken';
import { SlackResponseType, getSlackMessage, parsePayloadFromRequest, sanitizeSlackText } from 'utils/slack';

const jwtSecret = process.env.JWT_SECRET || '';
const baseURL = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const parsedPayload = await parsePayloadFromRequest(req);
    const { text, team_domain, team_id, user_id, user_name } = parsedPayload;

    const organizationName = sanitizeSlackText(team_domain);
    const rotationName = sanitizeSlackText(text.replace(/<[^>]+>/g, '')); // cleanup the command

    const dbClient = new PostgresClient(organizationName, rotationName);
    const organization = await dbClient.getOrganization(team_id);

    if (!organization) {
      return NextResponse.json(getSlackMessage(
        SlackResponseType.Ephemeral, 'Something went wrong, we could not authenticate you. Please reinstall the app.'
      ));
    }

    if(!rotationName) {
      return NextResponse.json(getSlackMessage(SlackResponseType.Ephemeral, 'Please specify a rotation name'));
    }

    const token = jwt.sign({ organization, user_id, user_name }, jwtSecret, { expiresIn: '1d' });

    const queryParameters = new URLSearchParams({
      user_id,
      user_name,
      organization_id: organizationName,
      rotation_id: rotationName,
      token: token,
    }).toString();

    const dashboardUrl = `${baseURL}/dashboard?${queryParameters}`;

    return NextResponse.json({
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `<${dashboardUrl}|Click here to access your dashboard>`,
          },
        },
      ],
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
