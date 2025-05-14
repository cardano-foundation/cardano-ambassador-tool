import { IWallet, resolveScriptHash } from "@meshsdk/core";
import { Layer1Tx } from "../lib/common";
import { minUtxos, scripts } from "../lib/constant";
import { counterDatum, oracleDatum } from "@/lib";

export class SetupTx extends Layer1Tx {
  wallet: IWallet;
  constructor(address: string, adminWallet: IWallet) {
    super(address);
    this.wallet = adminWallet;
  }

  newValidationTx = async (evaluateTx = true) => {
    const txBuilder = this.newTxBuilder(evaluateTx);
    const { utxos } = await this.getUtxos(this.address);
    const collateral = await this.wallet.getCollateral();
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
      .selectUtxosFrom(utxos, "experimental", "5000000");
    return txBuilder;
  };

  /**
   * Internal tx at setup
   * @returns
   */

  mintOracleNFT = async () => {
    const scriptCbor = scripts.oracle.mint.cbor;
    const policyId = resolveScriptHash(scriptCbor, "V3");
    const txBuilder = await this.newValidationTx();
    const txHex = await txBuilder
      .mintPlutusScriptV3()
      .mint("1", policyId, "")
      .mintingScript(scriptCbor)
      .mintRedeemerValue("")
      .complete();
    return txHex;
  };

  /**
   * Internal tx at setup
   * @returns
   */
  mintCounterNFT = async () => {
    const scriptCbor = scripts.counter.mint.cbor;
    const policyId = resolveScriptHash(scriptCbor, "V3");
    const txBuilder = await this.newValidationTx();
    const txHex = await txBuilder
      .mintPlutusScriptV3()
      .mint("1", policyId, "")
      .mintingScript(scriptCbor)
      .mintRedeemerValue("")
      .complete();
    return txHex;
  };

  /**
   * Internal tx at setup
   * @returns
   */
  mintAllNfts = async () => {
    const oracleScriptCbor = scripts.oracle.mint.cbor;
    const oraclePolicyId = resolveScriptHash(oracleScriptCbor, "V3");
    const counterScriptCbor = scripts.counter.mint.cbor;
    const counterPolicyId = resolveScriptHash(counterScriptCbor, "V3");

    const txBuilder = await this.newValidationTx();
    const txHex = await txBuilder
      .mintPlutusScriptV3()
      .mint("1", oraclePolicyId, "")
      .mintingScript(oracleScriptCbor)
      .mintRedeemerValue("")
      .mintPlutusScriptV3()
      .mint("1", counterPolicyId, "")
      .mintingScript(counterScriptCbor)
      .mintRedeemerValue("")
      .mintPlutusScriptV3()
      .complete();

    return txHex;
  };

  /**
   * Internal tx at setup - have to run after all tokens minted
   * @returns
   */
  setupOracles = async () => {
    const oracleNFT = scripts.oracle.mint.hash;
    const oracleAddress = scripts.oracle.spend.address;

    const counterToken = scripts.counter.mint.hash;
    const couterAddress = scripts.counter.spend.address;
    const couterInlineDatum = counterDatum(0);

    const txBuilder = await this.newValidationTx();
    const txHex = await txBuilder
      .txOut(oracleAddress, [
        { unit: "lovelace", quantity: minUtxos.oracle },
        { unit: oracleNFT, quantity: "1" },
      ])
      .txOutInlineDatumValue(oracleDatum, "JSON")
      .txOut(couterAddress, [
        { unit: "lovelace", quantity: minUtxos.oracle },
        { unit: counterToken, quantity: "1" },
      ])
      .txOutInlineDatumValue(couterInlineDatum, "JSON")
      .complete();
    return {
      txHex,
      oracleUtxoTxIndex: 0,
      counterUtxoTxIndex: 1,
    };
  };

  /**
   * Internal tx at setup
   * @returns
   */
  registerAllCerts = async () => {
    const treasuryWithdraw = scripts.treasury.withdraw.address;

    const txBuilder = await this.newValidationTx();
    const txHex = await txBuilder
      .registerStakeCertificate(treasuryWithdraw)
      .complete();

    return txHex;
  };
}
