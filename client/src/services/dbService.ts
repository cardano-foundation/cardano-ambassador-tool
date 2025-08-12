import { Database, SqlJsStatic } from "sql.js";
import initSqlJs from "sql.js/dist/sql-wasm.js";

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

/**
 * Initialize SQL.js and load the in-memory DB from worker data.
 * @param exportedDb - The database from the worker (Uint8Array or number[]).
 */
export async function initDb(exportedDb: Uint8Array | number[]): Promise<void> {
    if (!SQL) {
        SQL = await initSqlJs()
    }

    const uint8Array = exportedDb instanceof Uint8Array
        ? exportedDb
        : new Uint8Array(exportedDb);

    db = new SQL.Database(uint8Array);
    console.log("DB initialized from worker data.");
}

/**
 * Run a query and return the results as plain objects.
 * @param query - SQL SELECT query.
 * @param params - Query parameters.
 */
export function queryDb<T = Record<string, unknown>>(query: string, params: any[] = []): T[] {
    if (!db) throw new Error("Database not initialized. Call initDb() first.");

    const stmt = db.prepare(query);
    stmt.bind(params);

    const results: T[] = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject() as T);
    }
    stmt.free();
    return results;
}

/**
 * Get all UTXOs for a given context.
 * @param contextName - The context name to filter by.
 */
export function getUtxosByContext(contextName: string): Utxo[] {
    return queryDb<Utxo>("SELECT * FROM utxos WHERE context = ?", [contextName]);
}

/**
 * Interface representing a row from the UTXO table.
 */
export interface Utxo {
    id: number;
    txHash: string;
    outputIndex: number;
    address: string;
    amount: string;
    dataHash: string | null;
    plutusData: string | null;
    context: string;
}