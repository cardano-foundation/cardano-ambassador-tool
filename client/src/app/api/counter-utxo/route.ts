import { BlockfrostService } from "../../../services/blockfrostService";
import { getCatConstants } from "../../../utils";
import { NextResponse } from "next/server";

const blockfrost = new BlockfrostService();

/**
 * GET /api/counter-utxo
 *
 * Locates the counter UTxO by scanning the counter script address and
 * filtering by the counter NFT policy ID. The counter is a singleton, so
 * this is a single Blockfrost call — no caching needed (caching across
 * admins on serverless was the source of stale-pointer 500s).
 *
 * @returns The full MeshJS UTxO object if found, otherwise 404.
 */
export async function GET() {
  try {
    const catConstants = getCatConstants();
    const counterAddress = catConstants.scripts.counter.spend.address;
    const counterPolicyId = catConstants.scripts.counter.mint.hash;

    const utxos = await blockfrost.fetchAddressUTxOs(counterAddress);
    const counterUtxo = utxos.find((utxo) =>
      utxo.output.amount.some((a) => a.unit.startsWith(counterPolicyId)),
    );

    if (!counterUtxo) {
      return NextResponse.json(
        { error: "Counter UTxO not found on blockchain" },
        { status: 404 },
      );
    }

    return NextResponse.json(counterUtxo, { status: 200 });
  } catch (error) {
    console.error("Error fetching counter UTxO:", error);
    return NextResponse.json(
      { error: "Failed to fetch counter UTxO" },
      { status: 500 },
    );
  }
}
