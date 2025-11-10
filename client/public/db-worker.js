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

    // Ambassadors table
    db.run(`
      CREATE TABLE IF NOT EXISTS ambassadors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        href TEXT,
        username TEXT,
        name TEXT,
        bio_excerpt TEXT,
        country TEXT,
        flag TEXT,
        avatar TEXT,
        created_at TEXT,
        summary TEXT,
        activities TEXT,
        badges TEXT
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
  function insertAmbassador(amb) {
    const stmt = db.prepare(`
      INSERT INTO ambassadors (href, username, name, bio_excerpt, country, flag, avatar, created_at, summary, activities, badges)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      amb.href,
      amb.username,
      amb.name,
      amb.bio_excerpt,
      amb.country,
      amb.flag,
      amb.avatar,
      amb.created_at,
      JSON.stringify(amb.summary || {}),
      JSON.stringify(amb.activities || []),
      JSON.stringify(amb.badges || []),
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
