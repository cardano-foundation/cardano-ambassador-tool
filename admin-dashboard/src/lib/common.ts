import {
  MeshTxBuilder,
  Asset,
  MeshValue,
  UTxO,
  MeshTxBuilderOptions,
  IWallet,
  IFetcher,
  ISubmitter,
} from "@meshsdk/core";
import { CATConstants } from "./constant";
import { OfflineEvaluator } from "@meshsdk/core-csl";

export type IProvider = IFetcher & ISubmitter;
export type Network = "preprod" | "mainnet";

export class Layer1Tx {
  constructor(
    public wallet: IWallet,
    public address: string,
    public provider: IProvider,
    public catConstant: CATConstants
  ) {
    this.wallet = wallet;
    this.address = address;
    this.catConstant = catConstant;
  }

  getWalletUtxos = async () => {
    const utxos = await this.wallet.getUtxos();
    const pureAdaUtxos = utxos.filter(
      (utxo) =>
        utxo.output.amount.length === 1 &&
        Number(utxo.output.amount[0]!.quantity) >= 5_000_000
    );

    return { utxos: utxos, collaterals: pureAdaUtxos };
  };

  getUtxos = async (address: string) => {
    const utxos = await this.provider.fetchAddressUTxOs(address);
    return { utxos: utxos };
  };

  newTxBuilder = (evaluateTx = true) => {
    console.log("no csl");

    const txBuilderConfig: MeshTxBuilderOptions = {
      fetcher: this.provider,
      submitter: this.provider,
      verbose: true,
    };
    if (evaluateTx) {
      const evaluator = new OfflineEvaluator(
        this.provider,
        this.catConstant.network
      );
      txBuilderConfig.evaluator = evaluator;
    }

    const txBuilder = new MeshTxBuilder(txBuilderConfig);
    txBuilder.txEvaluationMultiplier = 1.5;

    txBuilder.setNetwork(
      this.catConstant.networkId === 1 ? "mainnet" : "preprod"
    );
    return txBuilder;
  };

  newTx = async () => {
    const txBuilder = this.newTxBuilder();
    const { utxos } = await this.getWalletUtxos();
    txBuilder.changeAddress(this.address).selectUtxosFrom(utxos);
    return txBuilder;
  };

  newValidationTx = async (evaluateTx = true) => {
    const txBuilder = this.newTxBuilder(evaluateTx);
    const { utxos } = await this.getWalletUtxos();
    const collateral = await this.wallet.getCollateral();
    console.log(collateral[0]);

    if (!collateral || collateral.length === 0) {
      throw new Error("Collateral is undefined");
    }
    txBuilder
      .txInCollateral(
        collateral[0]!.input.txHash,
        collateral[0]!.input.outputIndex,
        collateral[0]!.output.amount,
        collateral[0]!.output.address
      )
      .changeAddress(this.address)
      .selectUtxosFrom(utxos);
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
      this.catConstant.scripts.treasury.spend.address
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
