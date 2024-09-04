/**
 * @jest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { POST } from '@/app/api/v1/slack/rotation-post/route';
import { PostgresClient } from 'utils/database';
import { createMockRequest, mockSlackUser } from '../mocks';

const putItemsSpy = jest.spyOn(PostgresClient.prototype, 'putItems');
const createLogsTableIfNotExistsSpy = jest.spyOn(PostgresClient.prototype, 'createLogsTableIfNotExists');
const insertLogSpy = jest.spyOn(PostgresClient.prototype, 'insertLog');

describe('Rotation POST', () => {

  beforeEach(() => {
    putItemsSpy.mockResolvedValueOnce([mockSlackUser('U2147483697', true, false), mockSlackUser('U2147483698', true, false)]);
    createLogsTableIfNotExistsSpy.mockResolvedValueOnce();
    insertLogSpy.mockResolvedValueOnce();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('Happy paths', ()=>{
    it('Should add all users on a channel to the users table', async ()=>{
      putItemsSpy.mockResolvedValueOnce([mockSlackUser('U2147483697', true, false), mockSlackUser('U2147483698', true, false)]);

      const response = await POST(createMockRequest('test rotation <!subteam^S1234567|@usergroup>'));
      const responseBody = await response.json();

      expect(putItemsSpy).toHaveBeenCalledWith([mockSlackUser('U2147483697', true, false), mockSlackUser('U2147483698', true, false)]);
      expect(responseBody.text).toMatch(
        /test rotation.*Succesfully created the.*test rotation/i
      );
      expect(response.status).toBe(200);
    });
  });
});
