type SlackUser = {
  slackId: string;
  fullName: string;
  count: number;
  holiday: boolean;
  onDuty: boolean;
  backup: boolean;
};

/**
 * Retrieves the highest count from a list of Slack users.
 *
 * @param {SlackUser[]} users - An array of Slack users to retrieve the highest count from.
 * @return {number} The highest count found among the Slack users.
 */
export function getHighestCount(users: SlackUser[]): number {
  const highestCount = Math.max(...users.map((user) => user.count));
  return highestCount;
}

/**
 * Retrieves the Slack user who is currently on duty.
 *
 * @param {SlackUser[]} users - An array of Slack users to search through.
 * @return {SlackUser} The Slack user who is currently on duty.
 */
export function getCurrentSlackUser(users: SlackUser[]): SlackUser {
  const userOnDuty = users.find((user) => user.onDuty);
  if (!userOnDuty) {
    throw new Error('On duty user not found');
  }
  return userOnDuty;
}

/**
 * Filters an array of Slack users based on the highest count.
 *
 * @param {SlackUser[]} users - The array of Slack users to filter.
 * @param {number} highestCount - The highest count to filter by.
 * @return {SlackUser[]} The filtered array of Slack users.
 */

/**
 * Filters an array of Slack users based on the highest count, returning all users if no users have a lower count.
 *
 * @param {SlackUser[]} users - The array of Slack users to filter.
 * @param {number} highestCount - The highest count to filter by.
 * @return {SlackUser[]} The filtered array of Slack users.
 */
export function filterSlackUsers(users: SlackUser[], highestCount: number): SlackUser[] {
  const filteredSlackUsers = users.filter((user) => user.count < highestCount);
  if (filteredSlackUsers.length === 0) {
    filteredSlackUsers.push(...users);
  }
  return filteredSlackUsers;
}

/**
 * Selects a random Slack user from the provided list, excluding users with the highest count.
 *
 * @param {SlackUser[]} users - The list of Slack users to select from.
 * @param {number} highestCount - The highest count to exclude users with.
 * @return {SlackUser} A randomly selected Slack user.
 */
export function selectSlackUser(users: SlackUser[], highestCount: number): SlackUser {
  let filteredSlackUsers = users.filter((user) => user.count < highestCount);

  if (filteredSlackUsers.length === 0) filteredSlackUsers.push(...users);

  return filteredSlackUsers[Math.floor(Math.random() * filteredSlackUsers.length)];
}

