import { SlackUser } from 'types';
import { sql } from '@vercel/postgres';

/** These are the local names for the table private values inside the PosttgreClient */
export enum TableName {
  Logs = '_logsTable',
  Users = '_usersTable',
}

type CurrentActiveUsers = {
  userOnDuty: SlackUser;
  userOnBackup: SlackUser;
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

    console.log('The PostgresClient is ready to be used.');
    console.debug(this._logsTable, this._rotationName, this._organizationId, this._usersTable);

  }

  private constructTableNames = () => {
    const tableName = this._organizationId + '_' + this._rotationName; // marandino_standup
    this._usersTable = tableName + '_users';//marandino_standup_users
    this._logsTable = tableName + '_logs';//marandino_standup_logs
  }


  public async queryAll<T>(table: TableName): Promise<T[]> {
    console.log("I'm trying to query everything from:", this._logsTable, this._usersTable)
    const { rows } = await sql` SELECT * FROM ${this[table]};`;
    return rows as T[]
  }

  public async queryCurrentActiveUsers(): Promise<CurrentActiveUsers> {
    console.log(
      "Querying the user on duty and their backup in order from:",
      this._usersTable
    );
    const queryString = `
      SELECT * FROM ${this._usersTable}
      WHERE onDuty = true OR backup = true
      ORDER BY onDuty DESC;
    `;
    const { rows } = await sql.query(queryString);

    return { userOnDuty: rows[0], userOnBackup: rows[1] };
  }

  public async putItem<T extends Record<string, unknown>>(item: T, table: TableName): Promise<void> {
    console.log("I'm trying to put an item into:", this[table]);

    const columns = Object.keys(item);
    const values = Object.values(item);
    //TODO: sanitize the data here


    try {
      await this.createTableIfNotExists(table, columns, values);

      //TODO: make this into a function
      //
      const columnString = columns.join(', ');
      const valueParams = values.map((value) => `'${value}'`).join(', ');



      // TODO: make this support an array of items being inserted, it should be supported by just doing multiple (value1), (value2), (value3)
      const putQuery = `INSERT INTO ${this[table]} (${columnString}) VALUES (${valueParams});`
      await sql.query(putQuery);
      console.log(putQuery);
    } catch (error) {
      console.error("Error inserting item:", error);
      throw error;
    }
  }

  /** This function will confirm that the table exists prior to inserting a new item */
  private async createTableIfNotExists(table: TableName, columns: string[], values: unknown[]) {
    const queryString = this.createSqlQuery(table, columns, values)
    await sql.query(queryString)
  }



  // TODO: make it just destructure the values, and make it accept a custom string for the action
  private createSqlQuery(table: TableName, columns: string[], values: unknown[]) {
    return "CREATE TABLE IF NOT EXISTS " + this[table] + " (" +
      columns.map((column, index) => {
        return column + ' ' + this.getValueType(values[index]);
      }
      ).join(', ') + ');'
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
