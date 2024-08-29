import { Log, LogType, SlackUser } from 'types';

export function createLog(
  description: string,
  executedBy: string,
  type: LogType
): Log {
  return {
    description,
    date: Date.now(), // Automatically sets the current timestamp in milliseconds
    executed_by: executedBy,
    type,
  };
}

/**
 * @return The max amount of times an user has been selected.
 */
export function getHighestCount(users: SlackUser[]): number {
  return Math.max(...users.map((user) => user.count));
}

/**
 * Retrieves the Slack user who is currently on duty.
 */
export function getUserOnDuty(users: SlackUser[]): SlackUser {
  const userOnDuty = users.find((user) => user.on_duty);
  if (!userOnDuty) {
    throw new Error('On duty user not found');
  }
  return userOnDuty;
}

/**
 * Filters a list of Slack users to only include those who are on duty and not on holiday.
 */
export function filterUserOnDuty(users: SlackUser[]): SlackUser[] {
  return users.filter(user => !user.on_duty);
}

/**
 * Filters out the users that aren't selectable based on the number of times they have been selected.
 */
export function filterSlackUsers(users: SlackUser[]): SlackUser[] {
  const highestCount = getHighestCount(users);
  const filteredSlackUsers = users.filter((user) => user.count < highestCount);
  if (filteredSlackUsers.length === 0) {
    filteredSlackUsers.push(...users);
  }
  return filteredSlackUsers;
}

/**
 * Selects a random Slack user from the provided list, excluding users with the highest count.
 */
export function selectSlackUser(users: SlackUser[]): SlackUser {
  const usersNotOnDuty = filterUserOnDuty(users);
  const filteredSlackUsers = filterSlackUsers(usersNotOnDuty);
  return filteredSlackUsers[Math.floor(Math.random() * filteredSlackUsers.length)];
}

