/**
 * @jest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { POST } from '@/app/api/v1/slack/rotation/on-holiday-put/route'; // enpoint under test
import { PostgresClient, TableName } from 'utils/database';
import { NextRequest } from 'next/server';
import { SlackUser } from '@/_types';

// TODO: move this to a mock file
function mockSlackCommand(optional?: string): URLSearchParams {
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

function mockSlackUser(slackId: string, onDuty: boolean = false, onHoliday: boolean = false): SlackUser {
  return {
    slack_id: slackId,
    full_name: 'Ajinomoto',
    on_duty: onDuty,
    on_holiday: onHoliday,
    count: 0,
    on_backup: false,
  };
}

function createMockRequest(slackCommand: string){
  const mockFormData = mockSlackCommand(slackCommand);
  return {
    method: 'POST',
    headers: new Headers({
      'content-type': 'application/x-www-form-urlencoded',
    }),
    formData: () => mockFormData, // we're doing a formData() so this mocks the result of that function.
  } as unknown as NextRequest;
}

const toggleHolidayStatusSpy = jest.spyOn(PostgresClient.prototype, 'toggleHolidayStatus');
const insertLogSpy = jest.spyOn(PostgresClient.prototype, 'insertLog');

describe('On Holiday PUT', () => {

  beforeEach(() => {
    insertLogSpy.mockResolvedValueOnce();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('Happy paths', ()=>{
    it('Should toggle the holiday status of a user', async ()=>{
      toggleHolidayStatusSpy.mockResolvedValueOnce(mockSlackUser('U2147483697', true, false));

      const response = await POST(createMockRequest('test rotation <@U2147483697|Ajinomoto>'));
      const responseBody = await response.json();

      expect(toggleHolidayStatusSpy).toHaveBeenCalledWith('U2147483697');
      expect(responseBody.text).toMatch(
        /test rotation.*<@U2147483697>.*will.*be available/i
      );
      expect(response.status).toBe(200);
    });

  });

  describe('Edge cases and error handling', () => {
    it('should fail if there is no user', async ()=>{
      const response = await POST(createMockRequest('test rotation'));

      const responseBody = await response.json();

      expect(responseBody.text).toMatch(/user is required.*usage example/i);
      expect(response.status).toBe(200);

    });

    it('should fail if there is no rotation name', async ()=>{
      const response = await POST(createMockRequest('<@U2147483697>'));

      const responseBody = await response.json();

      expect(responseBody.text).toMatch(/user is required.*usage example/i);
      expect(response.status).toBe(200);
    });

    it.todo('should handle exceptions');
  });
});

