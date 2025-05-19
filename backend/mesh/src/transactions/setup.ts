import {
  Layer1Tx,
  scripts,
  counterDatum,
  minUtxos,
  oracleDatum,
  rMint,
} from "@/lib";
import { IWallet, resolveScriptHash } from "@meshsdk/core";

export class SetupTx extends Layer1Tx {
  constructor(address: string, adminWallet: IWallet) {
    super(adminWallet, address);
  }

  /**
   * Internal tx at setup
   * @returns
   */

  mintOracleNFT = async () => {
    const scriptCbor = scripts.oracle.mint.cbor;
    const policyId = resolveScriptHash(scriptCbor, "V3");
    const oracleAddress = scripts.oracle.spend.address;

    const utxos = await this.wallet.getUtxos();
    const paramUtxo = utxos[0]!;
    console.log(paramUtxo);

    const txBuilder = await this.newValidationTx();
    try {
      const unsignedTx = await txBuilder
        .txIn(
          paramUtxo.input.txHash,
          paramUtxo.input.outputIndex,
          paramUtxo.output.amount,
          paramUtxo.output.address
        )
        .mintPlutusScriptV3()
        .mint("1", policyId, "")
        .mintingScript(scriptCbor)
        .mintRedeemerValue(rMint, "JSON")
        .txOut(oracleAddress, [
          { unit: "lovelace", quantity: minUtxos.oracle },
          { unit: policyId, quantity: "1" },
        ])
        .txOutInlineDatumValue(oracleDatum, "JSON")
        .complete();

      const signedTx = await this.wallet.signTx(unsignedTx, true);
      const txHash = await this.wallet.submitTx(signedTx);

      return txHash;
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Internal tx at setup
   * @returns
   */
  mintCounterNFT = async () => {
    const scriptCbor = scripts.counter.mint.cbor;
    const policyId = resolveScriptHash(scriptCbor, "V3");
    const counterAddress = scripts.counter.spend.address;
    const couterInlineDatum = counterDatum(0);

    const utxos = await this.wallet.getUtxos();
    const paramUtxo = utxos[0]!;
    console.log(paramUtxo);

    const txBuilder = await this.newValidationTx();
    try {
      const unsignedTx = await txBuilder
        .txIn(
          paramUtxo.input.txHash,
          paramUtxo.input.outputIndex,
          paramUtxo.output.amount,
          paramUtxo.output.address
        )
        .mintPlutusScriptV3()
        .mint("1", policyId, "")
        .mintingScript(scriptCbor)
        .mintRedeemerValue(rMint, "JSON")
        .txOut(counterAddress, [
          { unit: "lovelace", quantity: minUtxos.counter },
          { unit: policyId, quantity: "1" },
        ])
        .txOutInlineDatumValue(couterInlineDatum, "JSON")
        .complete();

      const signedTx = await this.wallet.signTx(unsignedTx, true);
      const txHash = await this.wallet.submitTx(signedTx);

      return txHash;
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Internal tx at setup
   * @returns
   */
  registerAllCerts = async () => {
    const treasuryWithdraw = scripts.treasury.withdraw.address;

    const txBuilder = await this.newValidationTx();
    try {
      const unsignedTx = await txBuilder
        .registerStakeCertificate(treasuryWithdraw)
        .complete();

      const signedTx = await this.wallet.signTx(unsignedTx, true);
      const txHash = await this.wallet.submitTx(signedTx);

      return txHash;
    } catch (e) {
      console.error(e);
    }
  };
}
