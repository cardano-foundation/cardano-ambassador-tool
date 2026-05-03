import { CATConstants } from "@sidan-lab/cardano-ambassador-tool";

export function getCatConstants() {
  const envNetwork = process.env.NEXT_PUBLIC_NETWORK;
  if (envNetwork !== "mainnet" && envNetwork !== "preprod") {
    throw new Error(
      `NEXT_PUBLIC_NETWORK must be "mainnet" or "preprod", got: ${JSON.stringify(
        envNetwork,
      )}. Set NEXT_PUBLIC_NETWORK at build time.`,
    );
  }

  return CATConstants.fromNetwork(envNetwork);
}
