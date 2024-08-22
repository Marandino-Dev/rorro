/**
 * @jest-environment node
 */
import { describe, it, jest, expect } from '@jest/globals'
import { POST } from '@/app/api/v1/slack/rotation-post/route'

import { PostgresClient, TableName } from 'utils/database'
import { NextRequest } from 'next/server'

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

const putItemsSpy = jest.spyOn(PostgresClient.prototype, 'putItems')
const fetchSpy = jest.spyOn(global, 'fetch')

describe("RotationName POST", () => {

  it('should handle nextjs requests', async () => {
    fetchSpy.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ members: ['U2147483697'] })
      }) as any // I'm not going to mock the whole response with headers and all...
    )

    putItemsSpy.mockResolvedValueOnce([]);
    const mockFormData = mockSlackCommand('test rotation');

    const mockRequest = {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/x-www-form-urlencoded',
      }),
      formData: () => mockFormData,// we're doing a formData() so this mocks the result of that function.
    } as unknown as NextRequest

    const response = await POST(mockRequest)

    expect(putItemsSpy).toHaveBeenNthCalledWith(1,
      [
        {
          slackId: 'U2147483697',
          fullName: '',//we currently don't have access to the individual name, that's TODO:
          count: 0,
          holiday: false,
          onDuty: false,
          backup: false
        }
      ]
      , TableName.Users
    )
    expect(response.status).toBe(200)
  });

  it.todo("should handle if the body is incomplete")
  it.todo("should handle if the sql query fails")
})


