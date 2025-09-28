import { DatabaseService, ServiceStatus, ServiceInfo } from '@meetsolis/shared';
import { BaseService } from '../base-service';

export class MockDatabaseService
  extends BaseService
  implements DatabaseService
{
  private tables = new Map<string, Map<string, any>>();
  private queryLog: Array<{ sql: string; params?: any[]; timestamp: Date }> =
    [];

  constructor() {
    super();
    this.enableFallbackMode();
    this.initializeTables();
  }

  private initializeTables() {
    // Initialize common tables
    this.tables.set('users', new Map());
    this.tables.set('meetings', new Map());
    this.tables.set('recordings', new Map());
    this.tables.set('health_checks', new Map());
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  getServiceInfo(): ServiceInfo {
    return {
      name: 'Mock Database Service',
      version: '1.0.0',
      description:
        'In-memory mock database service for development and testing',
      dependencies: [],
    };
  }

  protected async performHealthCheck(): Promise<ServiceStatus> {
    await new Promise(resolve => setTimeout(resolve, 30));

    return {
      status: 'healthy',
      responseTime: 30,
      lastCheck: new Date(),
      errorCount: 0,
    };
  }

  async query(sql: string, params?: any[]): Promise<any> {
    console.log('[MockDatabaseService] Executing query:', sql, params);

    // Log the query
    this.queryLog.push({
      sql,
      params,
      timestamp: new Date(),
    });

    // Simulate query delay
    await new Promise(resolve => setTimeout(resolve, 50));

    // Simple SQL parsing for basic operations
    const sqlUpper = sql.trim().toUpperCase();

    if (sqlUpper.startsWith('SELECT')) {
      return this.handleSelect(sql);
    } else if (sqlUpper.startsWith('INSERT')) {
      return this.handleInsert(sql, params);
    } else if (sqlUpper.startsWith('UPDATE')) {
      return this.handleUpdate(sql, params);
    } else if (sqlUpper.startsWith('DELETE')) {
      return this.handleDelete(sql);
    }

    // For unknown queries, return empty result
    return { rows: [], rowCount: 0 };
  }

  private handleSelect(sql: string): any {
    // Extract table name (very basic parsing)
    const tableMatch = sql.match(/FROM\s+(\w+)/i);
    if (!tableMatch) {
      return { rows: [], rowCount: 0 };
    }

    const tableName = tableMatch[1];
    const table = this.tables.get(tableName);

    if (!table) {
      return { rows: [], rowCount: 0 };
    }

    const rows = Array.from(table.values());
    return { rows, rowCount: rows.length };
  }

  private handleInsert(sql: string, params?: any[]): any {
    // Very basic insert handling
    const tableMatch = sql.match(/INSERT\s+INTO\s+(\w+)/i);
    if (!tableMatch) {
      throw new Error('Invalid INSERT query');
    }

    const tableName = tableMatch[1];
    let table = this.tables.get(tableName);

    if (!table) {
      table = new Map();
      this.tables.set(tableName, table);
    }

    // Generate a mock ID
    const id = `mock-${tableName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const data = { id, ...(params?.[0] || {}) };

    table.set(id, data);

    return { rows: [data], rowCount: 1, insertId: id };
  }

  private handleUpdate(sql: string, params?: any[]): any {
    // Basic update handling
    const tableMatch = sql.match(/UPDATE\s+(\w+)/i);
    if (!tableMatch) {
      throw new Error('Invalid UPDATE query');
    }

    const tableName = tableMatch[1];
    const table = this.tables.get(tableName);

    if (!table) {
      return { rows: [], rowCount: 0 };
    }

    // For simplicity, update all rows
    let updatedCount = 0;
    const updateData = params?.[0] || {};

    table.forEach((row, id) => {
      table.set(id, { ...row, ...updateData });
      updatedCount++;
    });

    return { rows: [], rowCount: updatedCount };
  }

  private handleDelete(sql: string): any {
    // Basic delete handling
    const tableMatch = sql.match(/DELETE\s+FROM\s+(\w+)/i);
    if (!tableMatch) {
      throw new Error('Invalid DELETE query');
    }

    const tableName = tableMatch[1];
    const table = this.tables.get(tableName);

    if (!table) {
      return { rows: [], rowCount: 0 };
    }

    const initialSize = table.size;
    table.clear();

    return { rows: [], rowCount: initialSize };
  }

  async insert(table: string, data: any): Promise<any> {
    const sql = `INSERT INTO ${table} VALUES (?)`;
    return this.query(sql, [data]);
  }

  async update(table: string, id: string, data: any): Promise<any> {
    const sql = `UPDATE ${table} SET ? WHERE id = '${id}'`;
    return this.query(sql, [data]);
  }

  async delete(table: string, id: string): Promise<any> {
    const sql = `DELETE FROM ${table} WHERE id = '${id}'`;
    return this.query(sql);
  }

  // Mock-specific methods
  getQueryLog(): Array<{ sql: string; params?: any[]; timestamp: Date }> {
    return this.queryLog;
  }

  clearQueryLog(): void {
    this.queryLog = [];
  }

  getTableData(tableName: string): any[] {
    const table = this.tables.get(tableName);
    return table ? Array.from(table.values()) : [];
  }

  clearTable(tableName: string): void {
    const table = this.tables.get(tableName);
    if (table) {
      table.clear();
    }
  }

  clearAllTables(): void {
    this.tables.clear();
    this.initializeTables();
  }
}
