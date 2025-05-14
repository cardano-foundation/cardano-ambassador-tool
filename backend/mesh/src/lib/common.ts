import {
  MeshTxBuilder,
  Asset,
  MeshValue,
  UTxO,
  BlockfrostProvider,
  MaestroProvider,
  U5CProvider,
  deserializeAddress,
  pubKeyAddress,
  serializeAddressObj,
  MeshTxBuilderOptions,
} from "@meshsdk/core";
import { networkId, scripts } from "./constant";
import { CSLSerializer, OfflineEvaluator } from "@meshsdk/core-csl";

const blockfrostApiKey = process.env.BLOCKFROST_API_KEY || "";
const maestroApiKey = process.env.MAESTRO_API_KEY || "";
const u5cUrl = process.env.U5C_URL || "https://preprod.utxorpc-v0.demeter.run";
const u5cApiKey = process.env.U5C_API_KEY || "";
const network = (process.env.NETWORK_ID || "") === "1" ? "Mainnet" : "Preprod";

export const blockfrost = new BlockfrostProvider(blockfrostApiKey);
export const maestro = new MaestroProvider({ network, apiKey: maestroApiKey });

export const u5cProvider = new U5CProvider({
  url: u5cUrl,
  headers: {
    "dmtr-api-key": u5cApiKey,
  },
});

export const provider = blockfrost;
export const submitter = blockfrost;

export class Layer1Tx {
  enterprizeWalletAddress: string;

  constructor(public address: string) {
    const addr = deserializeAddress(address);
    const enterprizeAddressJson = pubKeyAddress(addr.pubKeyHash);
    this.enterprizeWalletAddress = serializeAddressObj(enterprizeAddressJson);
  }

  getUtxos = async (address: string) => {
    const utxos = await provider.fetchAddressUTxOs(address);
    const pureAdaUtxos = utxos.filter(
      (utxo) =>
        utxo.output.amount.length === 1 &&
        Number(utxo.output.amount[0]!.quantity) >= 5_000_000
    );

    return { utxos: utxos, collaterals: pureAdaUtxos };
  };

  newTxBuilder = (evaluateTx = true) => {
    const txBuilderConfig: MeshTxBuilderOptions = {
      fetcher: provider,
      serializer: new CSLSerializer(),
      verbose: true,
    };
    if (evaluateTx) {
      const evaluator = new OfflineEvaluator(
        provider,
        network.toLocaleLowerCase() as "mainnet" | "preprod"
      );
      txBuilderConfig.evaluator = evaluator;
    }

    const txBuilder = new MeshTxBuilder(txBuilderConfig);
    txBuilder.txEvaluationMultiplier = 1.5;

    txBuilder.setNetwork(networkId === 1 ? "mainnet" : "preprod");
    return txBuilder;
  };

  newTx = async () => {
    const txBuilder = this.newTxBuilder();
    const { utxos } = await this.getUtxos(this.address);
    txBuilder.changeAddress(this.address).selectUtxosFrom(utxos);
    return txBuilder;
  };

  prepare = async () => {
    const txBuilder = await this.newTx();
    const txHex = await txBuilder
      .txOut(this.address, [{ unit: "lovelace", quantity: "5000000" }])
      .txOut(this.address, [{ unit: "lovelace", quantity: "5000000" }])
      .txOut(this.address, [{ unit: "lovelace", quantity: "5000000" }])
      .complete();
    return txHex;
  };

  getUtxosForWithdrawal = async (withdrawalAmount: Asset[]) => {
    const selectedUtxos: UTxO[] = [];
    const selectedValue = new MeshValue();
    let { utxos: unselectedUtxos } = await this.getUtxos(
      scripts.treasury.spend.address
    );

    const nonLovelace = withdrawalAmount.filter(
      (asset) => asset.unit !== "lovelace"
    );

    for (const asset of nonLovelace) {
      const withdrawalValue = MeshValue.fromAssets([asset]);
      const assetUtxos: UTxO[] = [];
      const newUnselectedUtxos: UTxO[] = [];
      unselectedUtxos.forEach((utxo) => {
        if (utxo.output.amount.find((a) => a.unit === asset.unit)) {
          assetUtxos.push(utxo);
        } else {
          newUnselectedUtxos.push(utxo);
        }
      });

      for (let i = 0; i < assetUtxos.length; i++) {
        const utxo = assetUtxos[i] as UTxO;
        if (selectedValue.geq(withdrawalValue)) {
          newUnselectedUtxos.concat(assetUtxos.slice(i));
          break;
        }
        selectedUtxos.push(utxo);
        selectedValue.addAssets(utxo.output.amount);
      }
      unselectedUtxos = newUnselectedUtxos;
    }

    const lovelace = withdrawalAmount.find(
      (asset) => asset.unit === "lovelace"
    );
    const lovelaceWithdrawalValue = MeshValue.fromAssets([lovelace!]).addAsset({
      unit: "lovelace",
      quantity: "2000000",
    });
    for (const utxo of unselectedUtxos) {
      if (selectedValue.geq(lovelaceWithdrawalValue)) break;
      selectedUtxos.push(utxo);
      selectedValue.addAssets(utxo.output.amount);
    }

    selectedValue.negateAssets(withdrawalAmount);
    const returnValue = selectedValue.toAssets();
    return { selectedUtxos, returnValue };
  };
}

export const sleep = (second: number) =>
  new Promise((resolve) => setTimeout(resolve, second * 1000));
