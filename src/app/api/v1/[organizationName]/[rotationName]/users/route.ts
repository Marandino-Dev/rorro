import { createLog } from 'utils/logic';
import { type NextRequest, NextResponse } from 'next/server';
import { PostgresClient } from 'utils/database';

export async function GET(
  _: NextRequest,
  { params }: { params: { organizationName: string; rotationName: string; }; }
) {
  const { organizationName, rotationName } = params;

  try {
    const DbClient = new PostgresClient(organizationName, rotationName);
    const users = await DbClient.queryUsersForOrganizationAndRotation(organizationName, rotationName);

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error querying database:', error);

    // Return an error response if something goes wrong
    return NextResponse.json(
      { error: 'Failed to query users' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { organizationName: string; rotationName: string } }
) {
  const { organizationName, rotationName } = params;
  const { updateData, userId } = await request.json();

  const client = new PostgresClient(organizationName, rotationName);

  try {
    const updatedUser = await client.updateUser(
      userId,
      updateData
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Create a log entry
    const logEntry = createLog(
      `Updated user properties of: ${updatedUser.full_name}'}.`,
      'Dashboard',
      'status'
    );

    // Insert the log entry into the database
    await client.insertLog(organizationName, rotationName, logEntry);

    return NextResponse.json({ message: 'User updated', user: updatedUser });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { message: 'Error updating user', error: error.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { message: 'Unknown error occurred' },
        { status: 500 }
      );
    }
  }
}

