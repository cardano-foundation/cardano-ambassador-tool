import {
  Layer1Tx,
  ApplyMembership,
  applyMembership,
  MembershipIntentDatum,
  membershipIntentDatum,
  scripts,
  minUtxos,
  getTokenAssetNameByPolicyId,
  ProposeProject,
  proposeProject,
  ProposalDatum,
  proposalDatum,
  memberProposeProject,
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
        .mintingScript(scripts.membershipIntent.mint.cbor)
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
    const memberAssetName = getTokenAssetNameByPolicyId(
      memberUtxo,
      scripts.member.mint.hash
    );

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
        .txInScript(scripts.member.spend.cbor)
        .txInInlineDatumPresent()

        .mintPlutusScriptV3()
        .mint("1", scripts.proposeIntent.mint.hash, "to")
        .mintingScript(scripts.proposeIntent.mint.cbor)
        .mintRedeemerValue(redeemer, "JSON")

        .txOut(scripts.proposeIntent.spend.address, [
          { unit: "lovelace", quantity: minUtxos.proposeIntent },
          {
            unit: scripts.proposeIntent.mint.hash + memberAssetName,
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

      const txHex = await txBuilder.complete();
      const signedTx = await this.wallet.signTx(txHex);
      await this.wallet.submitTx(signedTx);

      return { txHex, txIndex: 0 };
    } catch (e) {
      console.error(e);
    }
  };
}
