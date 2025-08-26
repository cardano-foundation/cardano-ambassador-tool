'use client';

import {
  initUtxoWorker,
  onUtxoWorkerMessage,
  sendUtxoWorkerMessage,
} from '@/lib/utxoWorkerClient';
import { Utxo } from '@types';
import { useEffect, useState } from 'react';
import initSqlJs, { Database } from 'sql.js';
import initSqlJsLocal from '../context/sql-wasm.js';

// ---------- Database Manager Class ----------
class DatabaseManager {
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
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      if (this.initializationError) {
        throw this.initializationError;
      }
      return;
    }

    if (this.db) {
      // Database already initialized successfully
      return;
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
      const uint8Array = exportedDb instanceof Uint8Array 
        ? exportedDb 
        : new Uint8Array(exportedDb);

      // Create database from exported data  
      this.db = new this.SQL!.Database(uint8Array);
      this.lastSyncTime = new Date();
      console.log('[DB] Database initialized from worker data');
    } catch (error) {
      this.initializationError = error instanceof Error ? error : new Error('Unknown database initialization error');
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
    return this.query<Utxo>('SELECT * FROM utxos WHERE context = ?', [contextName]);
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

  // Helper method to get table information
  getTableInfo(tableName: string) {
    if (!this.db) return null;
    
    try {
      const result = this.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      return result[0];
    } catch (error) {
      console.warn(`Failed to get info for table ${tableName}:`, error);
      return null;
    }
  }
}

// ---------- Database operations ----------
const dbManager = DatabaseManager.getInstance();

const queryDb = <T = Record<string, unknown>>(sql: string, params: any[] = []): T[] => {
  return dbManager.query<T>(sql, params);
};

const getUtxosByContext = (contextName: string): Utxo[] => {
  return dbManager.getUtxosByContext(contextName);
};

export function useDatabase() {
  // Database state
  const [dbLoading, setDbLoading] = useState(true);
  const [intents, setIntents] = useState<Utxo[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);

  // Database initialization and worker setup
  useEffect(() => {
    console.log('[DB] Starting database initialization...');
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('[DB] Database loading timeout - proceeding without full data');
      setDbLoading(false);
      setDbError('Database loading timed out');
    }, 10000); // 10 second timeout

    try {
      // Initialize worker
      initUtxoWorker();

      // Listen for DB updates from worker
      const unsubscribe = onUtxoWorkerMessage(async (data) => {
        console.log('[DB] Received worker message:', Object.keys(data));
        
        if (data.db) {
          try {
            clearTimeout(timeoutId); // Cancel timeout
            console.log('[DB] Initializing database from worker data...');
            
            // Use the DatabaseManager to initialize
            await dbManager.initializeDatabase(data.db);
            
            // Query the initialized database
            const rows = dbManager.getUtxosByContext('membership_intent');
            console.log(`[DB] Found ${rows.length} membership intents`);
            
            setIntents(rows);
            setDbLoading(false);
            setDbError(null);
            console.log('[DB] Database ready, worker resources loaded');
          } catch (err) {
            clearTimeout(timeoutId);
            console.error('[DB] Error initializing database from worker:', err);
            setDbLoading(false);
            setDbError(err instanceof Error ? err.message : 'Database initialization failed');
          }
        }
      });

      // Request worker to seed all data
      console.log('[DB] Requesting worker to seed data...');
      syncAllData();

      return () => {
        clearTimeout(timeoutId);
        unsubscribe();
      };
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[DB] Error setting up database worker:', error);
      setDbLoading(false);
      setDbError('Failed to setup database worker');
    }
  }, []);

  // Database operations
  function syncAllData() {
    sendUtxoWorkerMessage({
      action: 'seedAll',
      apiBaseUrl: window.location.origin,
      contexts: [
        'member',
        'membership_intent',
        'proposal',
        'proposal_intent',
        'sign_of_approval',
        'ambassadors'
      ],
    });
  }

  function syncData(context: string) {
    sendUtxoWorkerMessage({
      action: 'seed',
      apiBaseUrl: window.location.origin,
      context,
    });
  }

  return {
    // State
    loading: dbLoading,
    intents,

    // Operations
    syncData,
    syncAllData,
    query: queryDb,
    getUtxosByContext,
  };
}
