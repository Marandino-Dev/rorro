import { type NextRequest, NextResponse } from 'next/server';

export function GET(
  request: NextRequest,
  { params }: { params: { organizationName: string; rotationName: string } }
) {
  const { organizationName, rotationName } = params;

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  console.log('Organization Name:', organizationName);
  console.log('Rotation Name:', rotationName);
  console.log('Query parameter:', query);

  return NextResponse.json(
    { organizationName, rotationName, query },
    { status: 200 }
  );
}
