import { Log, Organization, SlackUser } from 'types';
import { sql } from '@vercel/postgres';

/** These are the local names for the table private values inside the PosttgreClient */
// eslint-disable-next-line
export enum TableName {
  Logs = '_logsTable',
  Users = '_usersTable',
  Configurations = '_configurationsTable',
}

type CurrentActiveUsers = {
  userOnDuty: SlackUser;
  userOnBackup: SlackUser;
};

export class PostgresClient {

  _organizationId = '';// marandino
  _rotationName = '';// rotation

  _logsTable = '';// marandino_rotation_logs
  _usersTable = '';// marandino_rotation_users
  _configurationsTable = 'rotation_configurations';// this is the general configuration for rotations

  constructor(organizationId: string, rotationName: string) {
    this._organizationId = organizationId; // marandino
    this._rotationName = rotationName; // standup

    this.constructTableNames();
    console.debug('The PostgresClient is ready to be used.');
  }

  private constructTableNames = () => {
    const tableName = this._organizationId + '_' + this._rotationName; // marandino_standup
    this._usersTable = tableName + '_users';// marandino_standup_users
    this._logsTable = tableName + '_logs';// marandino_standup_logs
  };

  public async queryAll<T>(table: TableName): Promise<T[]> {
    console.log('I\'m trying to query everything from:', this._logsTable, this._usersTable);
    const { rows } = await sql` SELECT * FROM ${this[table]};`;
    return rows as T[];
  }

  public async queryCurrentActiveUsers(): Promise<CurrentActiveUsers> {
    console.log(
      `Querying the user on duty and their backup for: ${this._organizationId}, rotation: ${this._rotationName} from:`,
      this._usersTable
    );

    const queryString = `
      SELECT * FROM ${this._usersTable}
      WHERE on_duty = true OR on_backup = true
      ORDER BY on_duty DESC;
    `;

    const { rows } = await sql.query(queryString);

    return {
      userOnDuty: rows[0],
      userOnBackup: rows[1],
    };
  }

  public async queryUsersForOrganizationAndRotation(
    organizationName: string,
    rotationName: string,
    filterOnHoliday: boolean = false // Optional parameter to control filtering
  ): Promise<{ columns: string[], rows: SlackUser[] }> {

    console.info(`Querying users from: ${organizationName}, ${rotationName}`);
    const queryString = filterOnHoliday
      ? `SELECT * FROM ${this._usersTable} WHERE on_holiday = false`
      : `SELECT * FROM ${this._usersTable}`;
    const { rows } = await sql.query<SlackUser>(queryString, []);

    const columns = Object.keys(rows[0]);

    return { columns, rows };
  }

  public async queryLogsForOrganizationAndRotation(
    organizationName: string,
    rotationName: string
  ): Promise<{ columns: string[], rows: Log[] }> {

    console.info(`Writing log for: ${organizationName}, ${rotationName}`);

    const queryString = `SELECT * FROM ${this._logsTable} ORDER BY date DESC`;
    const { rows } = await sql.query<Log>(queryString, []);

    const columns = Object.keys(rows[0]);

    return { columns, rows };
  }

  public async insertLog(log: Log): Promise<void> {

    const queryString = `
      INSERT INTO ${this._logsTable} (description, date, executed_by, type)
      VALUES ($1, $2, $3, $4)
    `;
    const values = [log.description, log.date, log.executed_by, log.type];

    await sql.query(queryString, values)
      .catch((error) => {
        console.error('Error inserting log entry:', error);
      });

    console.info('Log inserted successfully:', log);
  }

  public async rotateUsers(
    userOnDutySlackId: string,
    newBackupSlackId: string | undefined,
    previousBackupSlackId: string | undefined
  ): Promise<void> {
    // Reset previous backup user
    if (previousBackupSlackId) {
      console.log(`Resetting backup for user: ${previousBackupSlackId}`);
      const resetPreviousBackupQuery = `
        UPDATE ${this._usersTable}
        SET on_backup = false
        WHERE slack_id = $1;
      `;
      await sql.query(resetPreviousBackupQuery, [previousBackupSlackId]);
    }

    if (newBackupSlackId) {
      console.log(`Setting new backup: ${newBackupSlackId}`);
      const setNewBackupQuery = `
        UPDATE ${this._usersTable}
        SET on_backup = true, on_duty = false
        WHERE slack_id = $1;
      `;
      await sql.query(setNewBackupQuery, [newBackupSlackId]);
    }
    console.log(`Setting user on duty: ${userOnDutySlackId}`);
    const setOnDutyQuery = `
      UPDATE ${this._usersTable}
      SET on_duty = true, count = count + 1
      WHERE slack_id = $1;
    `;
    await sql.query(setOnDutyQuery, [userOnDutySlackId]);
  }

  public async toggleHolidayStatus(toggledUserId: string): Promise<SlackUser> {
    console.log(`Toggling holiday status for user: ${toggledUserId}`);

    const updateQuery = `
        UPDATE ${this._usersTable}
        SET on_holiday = NOT on_holiday
        WHERE slack_id = $1
        RETURNING *;
    `;

    const { rows } = await sql.query(updateQuery, [toggledUserId]);
    return rows[0];
  }

  public async putItems<T extends Record<string, unknown>>(items: T[], table: TableName): Promise<T[]> {

    console.debug(`Writing ${items.length} item(s) into: ${this[table]}`);

    const columns = Object.keys(items[0]);
    const values = Object.values(items[0]);

    await this.createTableIfNotExists(table, columns, values);

    // prepare the query
    const columnString = columns.join(', ');
    const userValuesString = this.getValuesForUpdate<T>(items);

    const putQuery = `
      INSERT INTO ${this[table]} (${columnString})
      VALUES ${userValuesString}
      ON CONFLICT DO NOTHING
      RETURNING *;
    `;
    const { rows } = await sql.query<T>(putQuery);
    console.log('Rows inserted:', rows);
    return rows;
  }

  public async confirmTaskExists(): Promise<boolean> {
    const queryString = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = $1
      );
    `;
    const { rows } = await sql.query(queryString, [this._usersTable]);
    return rows[0].exists;
  }

  // Update usersTable

  public async updateUser(
    slackId: string,
    updatedData: Partial<SlackUser>
  ): Promise<SlackUser | null> {
    try {
      const updateFields = Object.keys(updatedData)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      const userUpdateValues = Object.values(updatedData);
      userUpdateValues.unshift(slackId); // SLACK ID AS FIRST VALUE

      const queryString = `
        UPDATE ${this._usersTable}
        SET ${updateFields}
        WHERE slack_id = $1
        RETURNING *;
      `;

      const { rows } = await sql.query<SlackUser>(queryString, userUpdateValues);

      if (rows.length === 0) {
        console.log('No user found with the provided Slack ID');
        return null;
      }

      console.log('User updated successfully:', rows[0]);
      return rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  /** This function will confirm that the table exists prior to inserting a new item */
  private async createTableIfNotExists(table: TableName, columns: string[], values: unknown[]) {
    const queryString = this.createSqlQuery(table, columns, values);
    await sql.query(queryString);
  }

  public async createLogsTableIfNotExists() {
    await sql.query(`
      CREATE TABLE IF NOT EXISTS ${this._logsTable} (
        description TEXT,
        date BIGINT,
        executed_by TEXT,
        type TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_date ON ${this._logsTable} (date DESC);
    `);
  }

  public static async getOrganization(team_id: string): Promise<Organization> {
    const queryString = 'SELECT * FROM organizations WHERE organization_id = $1';
    const slackAppId = process.env.SLACK_APP_ID;
    const { rows } = await sql.query<Organization>(queryString, [slackAppId + '-' + team_id]);
    return rows[0];
  }

  public static async putOrganization(organization: Organization) {
    const { organization_id, team_id, authed_user, scope, team_name, app_id, access_hash } = organization;
    const queryString = `
      INSERT INTO organizations (organization_id, team_id, authed_user, scope, team_name, app_id, access_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (organization_id) DO UPDATE SET
      access_hash = $7
    `;
    await sql.query(queryString, [organization_id, team_id, authed_user, scope, team_name, app_id, access_hash]);
  }

  /**
   * Formats multiple json objects in a way where the whole array can be inserted
   * to a table.
   * @return A string where all the elements are within parenthesis
   * @example `('name', 'true', 'false'), ('second name', 'false', 'true')`
   */
  private getValuesForUpdate<T extends Record<string, unknown>>(items: T[]) {
    const itemsArray: string[] = [];
    items.forEach(item => {
      const userValues = Object.values(item);
      const currentUserValues = userValues.map(value => `'${value}'`).join(', ');
      itemsArray.push(`(${currentUserValues})`);
    });

    return itemsArray.join(', ');
  }

  // TODO: make it just destructure the values, and make it accept a custom string for the action
  private createSqlQuery(table: TableName, columns: string[], values: unknown[]) {
    // Create the table if it doesn't exist
    const createTableQuery = 'CREATE TABLE IF NOT EXISTS ' + this[table] + ' (' +
      columns.map((column, index) => {
        return column + ' ' + this.getValueType(values[index]);
      }).join(', ') + ');';

    // Check if 'slack_id' column exists, otherwise use the first column
    const indexColumn = columns.includes('slack_id') ? 'slack_id' : columns[0];

    // Create a unique index on the chosen column to ensure no duplicates
    const createIndexQuery = `CREATE UNIQUE INDEX IF NOT EXISTS idx_${this[table]}_${indexColumn} ON ${this[table]} (${indexColumn});`;

    // Combine both queries
    return createTableQuery + ' ' + createIndexQuery;
  }

  // TODO: refactor this
  private getValueType(value: unknown) {

    if (typeof value === 'string') {
      return 'TEXT';
    } else if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        return 'INTEGER';
      } else {
        return 'NUMERIC';
      }
    } else if (typeof value === 'boolean') {
      return 'BOOLEAN';
    } else if (value instanceof Date) {
      return 'TIMESTAMP';
    } else if (Array.isArray(value)) {
      return 'JSON'; // TODO: maybe we don't need an array here... complex tables can be made on the fly
    } else if (typeof value === 'object' && value !== null) {
      return 'JSON';
    } else {
      return 'TEXT'; // Default to TEXT for unknown types
    }
  }

}
