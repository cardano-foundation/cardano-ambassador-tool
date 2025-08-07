console.log("worker started!!!!!!!!!!!!!");
self.importScripts("sql-wasm.js");

self.onmessage = async function (e) {

  console.log(e.data);
  
  const { action, context, contexts, apiBaseUrl, existingDb } = e.data;

  const SQL = await initSqlJs({ locateFile: () => "/sql-wasm.wasm" });
  let db;

  if (existingDb) {
    const uint8Array = new Uint8Array(existingDb);
    db = new SQL.Database(uint8Array);
  } else {
    db = new SQL.Database();
  }

  // Create table if it doesn't exist
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

  // Helper to insert one UTxO
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

  // Fetch and insert UTxOs for one context
  async function fetchAndStoreContext(contextName) {
    try {
      const res = await fetch(`${apiBaseUrl}/api/utxos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ context: contextName }),
      });

      const utxos = await res.json();

      if (Array.isArray(utxos)) {
        utxos.forEach((utxo) => insertUtxo(utxo, contextName));
      }
    } catch (err) {
      console.error(`Error fetching context "${contextName}":`, err);
    }
  }

  // Perform action
  if (action === "seed" && context) {
    await fetchAndStoreContext(context);
  }

  if (action === "seedAll" && Array.isArray(contexts)) {
    for (const ctx of contexts) {
      await fetchAndStoreContext(ctx);
    }
  }

  // Return updated DB
  const exported = db.export();
  self.postMessage({ db: Array.from(exported) });
  
};