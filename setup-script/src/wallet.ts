import { BlockfrostProvider, MeshWallet } from "@meshsdk/core";

export function createProvider(apiKey: string): BlockfrostProvider {
  return new BlockfrostProvider(apiKey);
}

export function createWallet(
  network: "preprod" | "mainnet",
  provider: BlockfrostProvider,
  mnemonic: string[],
): MeshWallet {
  const networkId = network === "mainnet" ? 1 : 0;
  return new MeshWallet({
    networkId,
    fetcher: provider,
    submitter: provider,
    key: {
      type: "mnemonic",
      words: mnemonic,
    },
  });
}
