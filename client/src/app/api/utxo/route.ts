import { BlockfrostProvider, UTxO } from "@meshsdk/core";
import { NextRequest, NextResponse } from "next/server";

const blockfrost = new BlockfrostProvider(
  process.env.BLOCKFROST_API_KEY_PREPROD || "",
);

type HandlerRequestBody = {
  params?: {
    txHash: string;
    outputIndex: number;
  };
};

export async function POST(req: NextRequest): Promise<
  | NextResponse<{
      error: string;
    }>
  | NextResponse<UTxO[]>
> {
  const body: HandlerRequestBody = await req.json();

  const { params } = body;

  if (!params) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  try {
    const utxo = await blockfrost.fetchUTxOs(params.txHash, params.outputIndex);
    return NextResponse.json(utxo, { status: 200 });
  } catch (error) {
    console.error("Blockfrost API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
