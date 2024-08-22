import { type NextRequest, NextResponse } from 'next/server';
import { PostgresClient } from "utils/database";

export async function GET(
    _: NextRequest,
    { params }: { params: { organizationName: string; rotationName: string; }; }
) {
    const { organizationName, rotationName } = params;
    console.log(`Organization: ${organizationName}, Rotation: ${rotationName} requested all the user on the rotation`);
    const DbClient = new PostgresClient(organizationName, rotationName);

    try {
        const users = await DbClient.queryUsersForOrganizationAndRotation(organizationName, rotationName);

        return NextResponse.json(
            { users },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error querying database:', error);

        // Return an error response if something goes wrong
        return NextResponse.json(
            { error: 'Failed to query users' },
            { status: 500 }
        );
    }
}
