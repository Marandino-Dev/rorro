/**
 * @jest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PostgresClient, TableName } from 'utils/database';
import { createMockRequest, mockSlackUserV2 } from '../mocks';

jest.mock('utils/slack', () => ({
  ...jest.requireActual<typeof import('utils/slack')>('utils/slack'),
  getSlackUsersFromChannel: jest.fn(),
  getSlackUsersFromUserGroup: jest.fn(),
}));
// Mocks
const { getSlackUsersFromChannel, getSlackUsersFromUserGroup } = require('utils/slack');

const getSlackUsersFromChannelMock = jest.mocked(getSlackUsersFromChannel);
const getSlackUsersFromUserGroupMock = jest.mocked(getSlackUsersFromUserGroup);

const putItemsSpy = jest.spyOn(PostgresClient.prototype, 'putItems');
const createLogsTableIfNotExistsSpy = jest.spyOn(PostgresClient.prototype, 'createLogsTableIfNotExists');
const insertLogSpy = jest.spyOn(PostgresClient.prototype, 'insertLog');

// Module under test - it is important that this placed after the mocks
const { POST } = require('@/app/api/v1/slack/rotation-post/route');

describe('Rotation POST', () => {
  beforeEach(() => {
    insertLogSpy.mockResolvedValueOnce();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy paths', () => {
    beforeEach(() => {
      // We're not doing anything with this data, so it doesn't matter what we return, but it should be returning the inserted users
      putItemsSpy.mockResolvedValueOnce([]);
      createLogsTableIfNotExistsSpy.mockResolvedValueOnce();
    });

    const mockUsers = [
      mockSlackUserV2({ full_name: 'Ajinomoto' }),
      mockSlackUserV2({ full_name: 'Pimienta' }),
    ];

    it('should create a rotation if only rotation name is provided', async () => {

      getSlackUsersFromChannelMock.mockResolvedValueOnce(mockUsers);

      const res = await POST(createMockRequest('test rotation'));
      const jsonResponse = await res.json();
      expect(jsonResponse.text).toMatch(/created.*test rotation/i);
      expect(putItemsSpy).toHaveBeenNthCalledWith(1,
        mockUsers, TableName.Users
      );
      expect(createLogsTableIfNotExistsSpy).toHaveBeenCalledTimes(1);
      expect(insertLogSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          type: 'status', // we don't really care about this that much tbh.
        })
      );
    });

    it('should create a rotation when rotation name and user group are provided', async () => {

      getSlackUsersFromUserGroupMock.mockResolvedValueOnce(mockUsers);

      const res = await POST(createMockRequest('test rotation <!subteam^S01234567890|test group>'));
      const jsonResponse = await res.json();
      expect(jsonResponse.text).toMatch(/created.*test rotation/i);
      expect(putItemsSpy).toHaveBeenNthCalledWith(1,
        mockUsers, TableName.Users
      );
      expect(createLogsTableIfNotExistsSpy).toHaveBeenCalledTimes(1);
      expect(insertLogSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          type: 'status', // we don't really care about this that much tbh.
        })
      );
    });
  });

  describe('Error handling and edge cases', () => {
    it('should return an error if the rotation name is not provided', async () => {
      const res = await POST(createMockRequest('<!subteam^S01234567890|test group>'));
      const jsonResponse = await res.json();
      expect(jsonResponse.text).toMatch(/rotation.*required/);
    });

    it('should return an error if the user group is not found', async () => {
      getSlackUsersFromUserGroupMock.mockResolvedValueOnce([]);

      const res = await POST(createMockRequest('test rotation <!subteam^S01234567890|test group>'));
      const jsonResponse = await res.json();

      expect(jsonResponse.text).toMatch(/users.*private channel.*@userGroup/i);
    });

    it('should return an error if there are no users in the channel', async () => {
      getSlackUsersFromChannelMock.mockResolvedValueOnce([]);

      const res = await POST(createMockRequest('test rotation'));
      const jsonResponse = await res.json();

      expect(jsonResponse.text).toMatch(/users.*private channel.*@userGroup/i);
    });

    it('should handle any of the write operations failing', async () => {
      getSlackUsersFromUserGroupMock.mockResolvedValueOnce(mockSlackUserV2());
      putItemsSpy.mockRejectedValueOnce(new Error('test error'));

      const res = await POST(createMockRequest('test rotation <!subteam^S01234567890|test group>'));
      const jsonResponse = await res.json();
      console.log('jsonResponse:', jsonResponse); // Debugging line to check the actual response

      expect(jsonResponse.text).toMatch(/error:.*request/i);
    });
  });
});
