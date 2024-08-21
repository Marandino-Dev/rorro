/**
 * @jest-environment node
 */
import { describe, it, jest, expect } from '@jest/globals'
import { SlackCommandPayload, SlackCommandRequest } from 'types'
import { POST } from '@/app/api/v1/slack/rotation-post/route'
import { PostgresClient, TableName } from 'utils/database'
import { NextRequest } from 'next/server'

function mockSlackCommand(optional: string): SlackCommandPayload {
  return {
    token: 'gIkuvaNzQIHg97ATvDxqgjtO',
    team_id: 'T0001',
    team_domain: 'marandtest',
    enterprise_name: 'Marandino%20Media',
    enterprise_id: 'C039480392',
    channel_id: 'C2147483705',
    api_app_id: 'Test api app id',
    channel_name: 'test-channel',
    user_id: 'U2147483697',
    user_name: 'Ajinomoto',
    command: '/rr',
    text: optional,
    response_url: 'https://hooks.slack.com/commands/1234/5678',
    trigger_id: '13345224609.738474920.8088930838d88f008e0',
  }
}

const putItemSpy = jest.spyOn(PostgresClient.prototype, 'putItem')

describe("RotationName POST", () => {

  it('should handle nextjs requests', async () => {
    putItemSpy.mockResolvedValueOnce();

    const requestParams = {
      json: async () =>
        mockSlackCommand('test rotation') // /rr test rotation
    } as NextRequest & SlackCommandRequest

    const response = await POST(requestParams)

    // ... the rest of the test as above.
    expect(putItemSpy).toHaveBeenNthCalledWith(1,
      {
        slackId: 'U2147483697',
        fullName: 'Ajinomoto',
        count: 0,
        holiday: false,
        onDuty: false,
        backup: false
      }, TableName.Users
    )
    expect(response.status).toBe(200)
  });

  it.todo("should handle if the body is incomplete")
  it.todo("should handle if the sql query fails")
})


