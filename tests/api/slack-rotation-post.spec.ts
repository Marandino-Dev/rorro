/**
 * @jest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { POST } from '@/app/api/v1/slack/rotation-post/route';
import { PostgresClient, TableName } from 'utils/database';
import { createMockRequest, mockSlackCommand, mockSlackUser } from '../mocks';

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

});