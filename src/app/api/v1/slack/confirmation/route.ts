import { NextRequest, NextResponse } from 'next/server';


export async function GET(
  req: NextRequest,
) {
  const confirmationCode = req.nextUrl.searchParams.get('code');
  console.log(confirmationCode);

  //make the request form
  try {

    const requestForm: Record<string, any> = new URLSearchParams();

    requestForm.append('client_secret', process.env.SLACK_CLIENT_SECRET);

    requestForm.append('client_id', process.env.SLACK_CLIENT_ID);
    requestForm.append('code', confirmationCode);
    // requestForm.append('grant_type', 'authorization_code');
    // requestForm.append('redirect_uri', 'https://development-rorro.vercel.ap');
    // TODO retrieve the code from Slack 
    //
    console.log('Client Secret:', process.env.SLACK_CLIENT_SECRET);
    console.log('Client ID:', process.env.SLACK_CLIENT_ID);
    console.log('Confirmation Code:', confirmationCode);
    console.log('Request Form:', requestForm.toString());

    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: requestForm.toString()
    });


    const data = await response.json();
    console.log('Response data:', data);
    if (!response.ok) {
      console.error('Response not OK:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const { access_token, authed_user } = data;
    const adminUserId = authed_user.id

    // Encrypt the code
    function encrypt
    // Save the code and the encription

    return NextResponse.redirect('http://localhost:3000/dashboard'); // TODO: redirect the user to the dashboard form the request domain.

  } catch (error) {
    console.log(error);

  }
}

