import { TransactionInfo } from '@meshsdk/core';
import { Utxo } from '@types';
import initSqlJs, { Database } from 'sql.js';
import initSqlJsLocal from '../context/sql-wasm.js';

// ---------- Database Manager Class ----------
export class DatabaseManager {
  private static instance: DatabaseManager;
  private SQL: initSqlJs.SqlJsStatic | null = null;
  private db: Database | null = null;
  private isInitializing = false;
  private initializationError: Error | null = null;
  private lastSyncTime: Date | null = null;

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async initializeDatabase(exportedDb: Uint8Array | number[]): Promise<void> {
    if (this.isInitializing) {
      // Wait for existing initialization to complete
      while (this.isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      if (this.initializationError) {
        throw this.initializationError;
      }
      return;
    }

    // Allow re-initialization (for sync operations)
    if (this.db) {
      this.db.close();
      this.db = null;
    }

    this.isInitializing = true;
    this.initializationError = null;

    try {
      // Initialize SQL.js only once
      if (!this.SQL) {
        this.SQL = await initSqlJsLocal({
          locateFile: () => '/sql-wasm.wasm',
        });
      }

      // Convert to Uint8Array if needed
      const uint8Array =
        exportedDb instanceof Uint8Array
          ? exportedDb
          : new Uint8Array(exportedDb);

      // Create database from exported data
      this.db = new this.SQL!.Database(uint8Array);
      this.lastSyncTime = new Date();
    } catch (error) {
      this.initializationError =
        error instanceof Error
          ? error
          : new Error('Unknown database initialization error');
      throw this.initializationError;
    } finally {
      this.isInitializing = false;
    }
  }

  query<T = Record<string, unknown>>(sql: string, params: any[] = []): T[] {
    if (!this.db) {
      throw new Error('Database not initialized. Worker data not loaded yet.');
    }

    const stmt = this.db.prepare(sql);
    stmt.bind(params);

    const results: T[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as T);
    }
    stmt.free();
    return results;
  }

  getUtxosByContext(contextName: string): Utxo[] {
    return this.query<Utxo>('SELECT * FROM utxos WHERE context = ?', [
      contextName,
    ]);
  }

  getPayoutUtxos(): TransactionInfo[] {
    return this.query<TransactionInfo>('SELECT * FROM treasury_payout_txs');
  }

  isReady(): boolean {
    return this.db !== null && !this.isInitializing;
  }

  getStatus() {
    return {
      isReady: this.isReady(),
      isInitializing: this.isInitializing,
      hasError: this.initializationError !== null,
      error: this.initializationError,
      lastSyncTime: this.lastSyncTime,
    };
  }
}
