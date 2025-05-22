import {
  Layer1Tx,
  ApplyMembership,
  applyMembership,
  MembershipIntentDatum,
  membershipIntentDatum,
  scripts,
  minUtxos,
  ProposeProject,
  proposeProject,
  ProposalDatum,
  proposalDatum,
  memberProposeProject,
  ref_tx_in_scripts,
} from "@/lib";
import { IWallet, stringToHex, UTxO } from "@meshsdk/core";

export class UserActionTx extends Layer1Tx {
  constructor(address: string, userWallet: IWallet) {
    super(userWallet, address);
  }

  applyMembership = async (
    oracleUtxo: UTxO,
    tokenUtxo: UTxO,
    tokenPolicyId: string,
    tokenAssetName: string
  ) => {
    const redeemer: ApplyMembership = applyMembership(
      tokenPolicyId,
      tokenAssetName // todo: stringToHex tbc
    );
    const datum: MembershipIntentDatum = membershipIntentDatum(
      tokenPolicyId,
      tokenAssetName // todo: stringToHex tbc
    );

    try {
      const txBuilder = await this.newValidationTx(true);
      txBuilder
        .readOnlyTxInReference(
          oracleUtxo.input.txHash,
          oracleUtxo.input.outputIndex
        )

        .txIn(
          tokenUtxo.input.txHash,
          tokenUtxo.input.outputIndex,
          tokenUtxo.output.amount,
          tokenUtxo.output.address
        )

        .mintPlutusScriptV3()
        .mint("1", scripts.membershipIntent.mint.hash, "")
        .mintTxInReference(
          ref_tx_in_scripts.membershipIntent.mint.txHash,
          ref_tx_in_scripts.membershipIntent.mint.outputIndex,
          (scripts.membershipIntent.mint.cbor.length / 2).toString(),
          scripts.membershipIntent.mint.hash
        )
        .mintRedeemerValue(redeemer, "JSON")

        .txOut(scripts.membershipIntent.spend.address, [
          { unit: "lovelace", quantity: minUtxos.applyMembership },
          {
            unit: scripts.membershipIntent.mint.hash,
            quantity: "1",
          },
        ])
        .txOutInlineDatumValue(datum, "JSON");

      if (tokenUtxo.output.plutusData) {
        txBuilder
          .txOut(tokenUtxo.output.address, tokenUtxo.output.amount)
          .txOutInlineDatumValue(tokenUtxo.output.plutusData, "CBOR");
      } else {
        txBuilder.txOut(tokenUtxo.output.address, tokenUtxo.output.amount);
      }

      const txHex = await txBuilder.complete();
      const signedTx = await this.wallet.signTx(txHex);
      await this.wallet.submitTx(signedTx);

      return { txHex, txIndex: 0 };
    } catch (e) {
      console.error(e);
    }
  };

  proposeProject = async (
    oracleUtxo: UTxO,
    tokenUtxo: UTxO,
    memberUtxo: UTxO,
    project_url: string,
    fund_requested: number,
    receiver: string
  ) => {
    const redeemer: ProposeProject = proposeProject(
      stringToHex(project_url),
      fund_requested,
      receiver
    );
    const datum: ProposalDatum = proposalDatum(
      stringToHex(project_url),
      fund_requested,
      receiver
    );

    try {
      const txBuilder = await this.newValidationTx(true);
      txBuilder
        .readOnlyTxInReference(
          oracleUtxo.input.txHash,
          oracleUtxo.input.outputIndex
        )

        .txIn(
          tokenUtxo.input.txHash,
          tokenUtxo.input.outputIndex,
          tokenUtxo.output.amount,
          tokenUtxo.output.address
        )

        .spendingPlutusScriptV3()
        .txIn(
          memberUtxo.input.txHash,
          memberUtxo.input.outputIndex,
          memberUtxo.output.amount,
          memberUtxo.output.address
        )
        .txInRedeemerValue(memberProposeProject, "JSON")
        .spendingTxInReference(
          ref_tx_in_scripts.member.spend.txHash,
          ref_tx_in_scripts.member.spend.outputIndex,
          (scripts.member.spend.cbor.length / 2).toString(),
          scripts.member.spend.hash
        )
        .txInInlineDatumPresent()

        .mintPlutusScriptV3()
        .mint("1", scripts.proposeIntent.mint.hash, "") // todo: assetName
        .mintTxInReference(
          ref_tx_in_scripts.proposeIntent.mint.txHash,
          ref_tx_in_scripts.proposeIntent.mint.outputIndex,
          (scripts.proposeIntent.mint.cbor.length / 2).toString(),
          scripts.proposeIntent.mint.hash
        )
        .mintRedeemerValue(redeemer, "JSON")

        .txOut(scripts.proposeIntent.spend.address, [
          { unit: "lovelace", quantity: minUtxos.proposeIntent },
          {
            unit: scripts.proposeIntent.mint.hash,
            quantity: "1",
          },
        ])
        .txOutInlineDatumValue(datum, "JSON");

      if (tokenUtxo.output.plutusData) {
        txBuilder
          .txOut(tokenUtxo.output.address, tokenUtxo.output.amount)
          .txOutInlineDatumValue(tokenUtxo.output.plutusData, "CBOR");
      } else {
        txBuilder.txOut(tokenUtxo.output.address, tokenUtxo.output.amount);
      }

      txBuilder
        .txOut(memberUtxo.output.address, memberUtxo.output.amount)
        .txOutInlineDatumValue(memberUtxo.output.plutusData!, "CBOR");

      const txHex = txBuilder.completeUnbalanced();
      console.log(txHex);
      const evaluation = await txBuilder.evaluator?.evaluateTx(txHex, [], []);
      console.log(evaluation);
      const txHex2 = await txBuilder.complete();
      console.log(txHex2);
      // const signedTx = await this.wallet.signTx(txHex);
      // await this.wallet.submitTx(signedTx);

      return {
        txHex,
        proposeIntentUtxoTxIndex: 0,
        tokenUtxoTxIndex: 1,
        memberUtxoTxIndex: 2,
      };
    } catch (e) {
      console.error(e);
    }
  };
}
