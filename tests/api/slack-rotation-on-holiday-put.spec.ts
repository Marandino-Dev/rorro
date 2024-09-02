/**
 * @jest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { POST } from '@/app/api/v1/slack/rotation/on-holiday-put/route'; // enpoint under test
import { PostgresClient } from 'utils/database';
import { createMockRequest, mockSlackUser } from '../mocks';

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

      expect(responseBody.text).toMatch(/user.*required.*usage example/i);
      expect(response.status).toBe(200);

    });

    it('should fail if there is no rotation name', async ()=>{
      const response = await POST(createMockRequest('<@U2147483697>'));

      const responseBody = await response.json();

      expect(responseBody.text).toMatch(/task.*required.*usage example/i);
      expect(response.status).toBe(200);
    });

    it('should handle exceptions', async ()=>{
      toggleHolidayStatusSpy.mockRejectedValueOnce(new Error('Something went wrong'));

      const response = await POST(createMockRequest('test rotation <@U2147483697>'));

      const responseBody = await response.json();

      expect(responseBody.text).toMatch(/something went wrong.*please try again/i);
      expect(response.status).toBe(200);
    });
  });
});

