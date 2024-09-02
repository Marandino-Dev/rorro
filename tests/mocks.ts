import { type NextRequest } from 'next/server';
import { SlackUser } from 'types';

export function mockSlackCommand(optional?: string): URLSearchParams {
  return new URLSearchParams({
    token: 'gIkuvaNzQIHg97ATvDxqgjtO',
    team_id: 'T0001',
    team_domain: 'marandtest',
    enterprise_name: 'Marandino Media',
    enterprise_id: 'C039480392',
    channel_id: 'C2147483705',
    api_app_id: 'Test api app id',
    channel_name: 'test-channel',
    user_id: 'U2147483697',
    user_name: 'Ajinomoto',
    command: '/rr',
    text: optional || 'test rotation',
    response_url: 'https://hooks.slack.com/commands/1234/5678',
    trigger_id: '13345224609.738474920.8088930838d88f008e0',
  });
}

export function mockSlackUser(slackId: string, onDuty: boolean = false, onHoliday: boolean = false): SlackUser {
  return {
    slack_id: slackId,
    full_name: 'Ajinomoto',
    on_duty: onDuty,
    on_holiday: onHoliday,
    count: 0,
    on_backup: false,
  };
}

export function createMockRequest(slackCommand: string){
  const mockFormData = mockSlackCommand(slackCommand);
  return {
    method: 'POST',
    headers: new Headers({
      'content-type': 'application/x-www-form-urlencoded',
    }),
    formData: () => mockFormData, // we're doing a formData() so this mocks the result of that function.
  } as unknown as NextRequest;
}

