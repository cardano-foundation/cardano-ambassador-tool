
self.importScripts('sql-wasm.js');

self.onmessage = async function (e) {
  const { action, context, contexts, apiBaseUrl, existingDb, isSyncOperation } =
    e.data;

  const SQL = await initSqlJs({ locateFile: () => '/sql-wasm.wasm' });
  let db = new SQL.Database();

  /**
   * -------------------------
   *   TABLE CREATION
   * -------------------------
   */
  function createTables() {
    // UTxO table
    db.run(`
      CREATE TABLE IF NOT EXISTS utxos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        txHash TEXT,
        outputIndex INTEGER,
        address TEXT,
        amount TEXT,
        dataHash TEXT,
        plutusData TEXT,
        context TEXT,
        parsedMetadata TEXT
      );
    `);

    db.run(`CREATE INDEX IF NOT EXISTS idx_txHash ON utxos(txHash);`);

    db.run(`
      CREATE TABLE IF NOT EXISTS treasury_payout_txs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      block TEXT,
      deposit TEXT,
      slot TEXT,
      fees TEXT,
      hash TEXT,
      invalidAfter TEXT,
      invalidBefore TEXT,
      size INTEGER,
      inputs TEXT,
      outputs TEXT,
      blockHeight INTEGER,
      blockTime INTEGER
    );
    `);

    
  }
  createTables();

  /**
   * -------------------------
   *   HELPERS
   * -------------------------
   */

  // Insert UTxO
  function insertUtxo(utxo, contextName) {
    const stmt = db.prepare(`
      INSERT INTO utxos (txHash, outputIndex, address, amount, dataHash, plutusData, context, parsedMetadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      utxo.input.txHash,
      utxo.input.outputIndex,
      utxo.output.address,
      JSON.stringify(utxo.output.amount),
      utxo.output.dataHash || null,
      utxo.output.plutusData || null,
      contextName,
      utxo.parsedMetadata ? JSON.stringify(utxo.parsedMetadata) : null,
    ]);

    stmt.free();
  }

  // Insert Ambassador
  function insertPayOutTxs(tx) {    
    const stmt = db.prepare(`
      INSERT INTO treasury_payout_txs (block, deposit, fees, hash, invalidAfter, invalidBefore, size, inputs, outputs, blockHeight, blockTime, slot)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      tx.block,
      tx.deposit,
      tx.fees,
      tx.hash,
      tx.invalidAfter,
      tx.invalidBefore,
      tx.size,
      JSON.stringify(tx.inputs || []),
      JSON.stringify(tx.outputs || []),
      tx.blockHeight,
      tx.blockTime,
      tx.slot
    ]);

    stmt.free();
  }

  /**
   * -------------------------
   *   FETCHERS
   * -------------------------
   */

  // Fetch and store UTxOs
  async function fetchAndStoreContext(contextName) {
    if (contextName === 'treasury_payouts') {
      return fetchStorePayoutTxs();
    }

    const res = await fetch(`${apiBaseUrl}/api/utxos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context: contextName }),
    });

    const utxos = await res.json();

    if (Array.isArray(utxos)) {
      utxos.forEach((utxo) => insertUtxo(utxo, contextName));
    }
  }

  async function fetchStorePayoutTxs() {
    const res = await fetch(`${apiBaseUrl}/api/txs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ forceRefresh: false })
    });

    const txs = await res.json();

    if (Array.isArray(txs)) {
      txs.forEach((tx) => insertPayOutTxs(tx));
    }
  }


  /**
   * -------------------------
   *   ACTION HANDLERS
   * -------------------------
   */

  if (action === 'seed' && context) {
    await fetchAndStoreContext(context);
  }

  if (action === 'seedAll' && Array.isArray(contexts)) {
    const results = await Promise.allSettled(
      contexts.map((ctx) => fetchAndStoreContext(ctx)),
    );

    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        // Silent fail during build
      }
    });
  }

  /**
   * -------------------------
   *   EXPORT DB
   * -------------------------
   */
  const exported = db.export();
  self.postMessage({
    db: Array.from(exported),
    isSyncOperation: isSyncOperation || false,
  });
};
