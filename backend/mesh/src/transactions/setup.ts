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
  mintCounterNFT = async () => {
    const scriptCbor = scripts.counter.mint.cbor;
    const policyId = resolveScriptHash(scriptCbor, "V3");

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
  mintSpendOracleNFT = async () => {
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
  spendCounterNFT = async () => {
    const scriptCbor = scripts.counter.mint.cbor;
    const policyId = resolveScriptHash(scriptCbor, "V3");
    const counterAddress = scripts.counter.spend.address;
    const couterInlineDatum = counterDatum(0);

    const txBuilder = await this.newValidationTx();
    try {
      const unsignedTx = await txBuilder
        .txIn(
          "94e4833e674c35474137b8c628eab6cacd48b154ff1b891b04b0daab55e276de",
          0
        )

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

  /**
   * Internal tx at setup
   * @returns
   */
  txOutScript = async () => {
    const address =
      "addr_test1qqyxeduckrmffn26gjffda77nfu560xctycf00jcnr74p7vdx9gcw644ygkqgqcfm5nlrecqv0rzp0qcyw55q3lxcpkq093wet";

    const txBuilder = await this.newValidationTx();
    try {
      // const unsignedMembershipIntentTx = await txBuilder
      //   .txOut(address, [{ unit: "lovelace", quantity: minUtxos.script }])
      //   .txOutReferenceScript(scripts.membershipIntent.mint.cbor)
      //   .txOut(address, [{ unit: "lovelace", quantity: minUtxos.script }])
      //   .txOutReferenceScript(scripts.membershipIntent.spend.cbor)
      //   .complete();

      // const signedMembershipIntentTx = await this.wallet.signTx(
      //   unsignedMembershipIntentTx,
      //   true
      // );
      // const membershipIntentTxHash = await this.wallet.submitTx(
      //   signedMembershipIntentTx
      // );

      // const unsignedMemberTx = await txBuilder
      //   .txOut(address, [{ unit: "lovelace", quantity: minUtxos.script }])
      //   .txOutReferenceScript(scripts.member.mint.cbor)
      //   .txOut(address, [{ unit: "lovelace", quantity: minUtxos.script }])
      //   .txOutReferenceScript(scripts.member.spend.cbor)
      //   .complete();

      // const signedMemberTx = await this.wallet.signTx(unsignedMemberTx, true);
      // const memberTxHash = await this.wallet.submitTx(signedMemberTx);

      // const unsignedProposeIntentTx = await txBuilder
      //   .txOut(address, [{ unit: "lovelace", quantity: minUtxos.script }])
      //   .txOutReferenceScript(scripts.proposeIntent.mint.cbor)
      //   .txOut(address, [{ unit: "lovelace", quantity: minUtxos.script }])
      //   .txOutReferenceScript(scripts.proposeIntent.spend.cbor)
      //   .complete();

      // const signedProposeIntentTx = await this.wallet.signTx(
      //   unsignedProposeIntentTx,
      //   true
      // );
      // const proposeIntentTxHash = await this.wallet.submitTx(
      //   signedProposeIntentTx
      // );

      // const unsignedProposalTx = await txBuilder
      //   .txOut(address, [{ unit: "lovelace", quantity: minUtxos.script }])
      //   .txOutReferenceScript(scripts.proposal.mint.cbor)
      //   .txOut(address, [{ unit: "lovelace", quantity: minUtxos.script }])
      //   .txOutReferenceScript(scripts.proposal.spend.cbor)
      //   .complete();

      // const signedProposalTx = await this.wallet.signTx(
      //   unsignedProposalTx,
      //   true
      // );
      // const proposalTxHash = await this.wallet.submitTx(signedProposalTx);

      // const unsignedSignOffApprovalTx = await txBuilder
      //   .txOut(address, [{ unit: "lovelace", quantity: minUtxos.script }])
      //   .txOutReferenceScript(scripts.signOffApproval.mint.cbor)
      //   .txOut(address, [{ unit: "lovelace", quantity: minUtxos.script }])
      //   .txOutReferenceScript(scripts.signOffApproval.spend.cbor)
      //   .complete();

      // const signedSignOffApprovalTx = await this.wallet.signTx(
      //   unsignedSignOffApprovalTx,
      //   true
      // );
      // const signOffApprovalTxHash = await this.wallet.submitTx(
      //   signedSignOffApprovalTx
      // );

      const unsignedTreasuryTx = await txBuilder
        .txOut(address, [{ unit: "lovelace", quantity: minUtxos.script }])
        .txOutReferenceScript(scripts.treasury.spend.cbor)
        .txOut(address, [{ unit: "lovelace", quantity: minUtxos.script }])
        .txOutReferenceScript(scripts.treasury.withdraw.cbor)
        .complete();

      const signedTreasuryTx = await this.wallet.signTx(
        unsignedTreasuryTx,
        true
      );
      const treasuryTxHash = await this.wallet.submitTx(signedTreasuryTx);

      return {
        // membershipIntent: membershipIntentTxHash,
        // member: memberTxHash,
        // proposeIntent: proposeIntentTxHash,
        // proposal: proposalTxHash,
        // signOffApproval: signOffApprovalTxHash,
        treasury: treasuryTxHash,
      };
    } catch (e) {
      console.error(e);
    }
  };
}
