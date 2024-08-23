import { SlackUser } from 'types';
import { sql } from '@vercel/postgres';

/** These are the local names for the table private values inside the PosttgreClient */
//eslint-disable-next-line
export enum TableName {
  Logs = '_logsTable',
  Users = '_usersTable',
}

export class PostgresClient {

  _organizationId = '';//marandino
  _rotationName = '';//rotation

  _logsTable = '';//marandino_rotation_logs
  _usersTable = '';//marandino_rotation_users

  constructor(organizationId: string, rotationName: string) {
    this._organizationId = organizationId; // marandino
    this._rotationName = rotationName; // standup

    this.constructTableNames();

    console.debug('The PostgresClient is ready to be used.');
  }

  private constructTableNames = () => {
    const tableName = this._organizationId + '_' + this._rotationName; // marandino_standup
    this._usersTable = tableName + '_users';//marandino_standup_users
    this._logsTable = tableName + '_logs';//marandino_standup_logs
  };

  public async queryAll<T>(table: TableName): Promise<T[]> {
    console.log("I'm trying to query everything from:", this._logsTable, this._usersTable);
    const { rows } = await sql` SELECT * FROM ${this[table]};`;
    return rows as T[];
  }

  public async queryUsersForOrganizationAndRotation(
    organizationName: string,
    rotationName: string
  ): Promise<{ columns: string[], rows: SlackUser[] }> {

    console.info(`Querying users from: ${organizationName}, ${rotationName}`);

    const queryString = `SELECT * FROM ${this._usersTable}`;
    const { rows } = await sql.query<SlackUser>(queryString, []);

    const columns = Object.keys(rows[0]);

    return { columns, rows };
  }


  public async putItems<T extends Record<string, unknown>>(items: T[], table: TableName): Promise<T[]> {

    console.debug(`Writing ${items.length} item(s) into: ${this[table]}`);

    const columns = Object.keys(items[0]);
    const values = Object.values(items[0]);

    await this.createTableIfNotExists(table, columns, values);

    // prepare the query
    const columnString = columns.join(', ');
    const userValuesString = this.getValuesForUpdate<T>(items)

    const putQuery = `INSERT INTO ${this[table]} (${columnString}) VALUES ${userValuesString};`
    const { rows } = await sql.query<T>(putQuery);
    return rows
  }

  /** This function will confirm that the table exists prior to inserting a new item */
  private async createTableIfNotExists(table: TableName, columns: string[], values: unknown[]) {
    const queryString = this.createSqlQuery(table, columns, values);
    await sql.query(queryString);
  }


  /**
   * Formats multiple json objects in a way where the whole array can be inserted
   * to a table.
   * @return A string where all the elements are within parenthesis
   * @example `('name', 'true', 'false'), ('second name', 'false', 'true')`
   */
  private getValuesForUpdate<T extends Record<string, unknown>>(items: T[]) {
    const itemsArray: string[] = []
    items.forEach(item => {
      const userValues = Object.values(item);
      const currentUserValues = userValues.map(value => `'${value}'`).join(', ')
      itemsArray.push(`(${currentUserValues})`)
    });

    return itemsArray.join(', ')
  }


  // TODO: make it just destructure the values, and make it accept a custom string for the action
  private createSqlQuery(table: TableName, columns: string[], values: unknown[]) {
    return "CREATE TABLE IF NOT EXISTS " + this[table] + " (" +
      columns.map((column, index) => {
        return column + ' ' + this.getValueType(values[index]);
      }
      ).join(', ') + ');';
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
      return 'JSON'; //TODO: maybe we don't need an array here... complex tables can be made on the fly
    } else if (typeof value === 'object' && value !== null) {
      return 'JSON';
    } else {
      return 'TEXT'; // Default to TEXT for unknown types
    }
  }

}
