import { type NextRequest, NextResponse } from 'next/server';
import { PostgresClient } from 'utils/database';

export async function GET(
  _: NextRequest,
  { params }: { params: { organizationName: string; rotationName: string; }; }
) {
  const { organizationName, rotationName } = params;

  try {
    const DbClient = new PostgresClient(organizationName, rotationName);
    const logs = await DbClient.queryLogsForOrganizationAndRotation(organizationName, rotationName);

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error querying database:', error);

    // Return an error response if something goes wrong
    return NextResponse.json(
      { error: 'Failed to query users' },
      { status: 500 }
    );
  }
}