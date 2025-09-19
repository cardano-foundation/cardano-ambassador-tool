console.log('App started!!!!!!!!!!!!!');
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
        context TEXT
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
      INSERT INTO utxos (txHash, outputIndex, address, amount, dataHash, plutusData, context)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      utxo.input.txHash,
      utxo.input.outputIndex,
      utxo.output.address,
      JSON.stringify(utxo.output.amount),
      utxo.output.dataHash || null,
      utxo.output.plutusData || null,
      contextName,
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
    if (contextName === 'ambassadors') {
      await fetchAndStoreAmbassadors();
      return;
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

  // Fetch and store Ambassadors
  async function fetchAndStoreAmbassadors() {
    const res = await fetch(`${apiBaseUrl}/api/ambassadors`);
    const ambassadors = await res.json();

    if (Array.isArray(ambassadors)) {
      ambassadors.forEach((amb) => insertAmbassador(amb));
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
        console.error(`Failed to seed context ${contexts[i]}:`, result.reason);
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
