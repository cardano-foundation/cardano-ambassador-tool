import { IWallet, UTxO } from "@meshsdk/core";
import { Layer1Tx } from "../lib/common";
import { minUtxos, scripts } from "../lib/constant";

import {
  applyMembership,
  ApplyMembership,
  memberProposeProject,
  MembershipIntentDatum,
  membershipIntentDatum,
  proposalDatum,
  ProposalDatum,
  ProposeProject,
  proposeProject,
} from "@/lib";

export class UserActionTx extends Layer1Tx {
  constructor(address: string, userWallet: IWallet) {
    super(userWallet, address);
  }

  /**
   * External tx called by user
   * @param utxos
   * @param toDeposit
   * @returns
   */
  applyMembership = async (
    oracleUtxo: UTxO,
    tokenUtxo: UTxO,
    tokenPolicyId: string,
    tokenAssetName: string
  ) => {
    const redeemer: ApplyMembership = applyMembership(
      tokenPolicyId,
      tokenAssetName
    );
    const datum: MembershipIntentDatum = membershipIntentDatum(
      tokenPolicyId,
      tokenAssetName
    );

    const txBuilder = await this.newValidationTx(true);
    txBuilder
      .readOnlyTxInReference(
        oracleUtxo.input.txHash,
        oracleUtxo.input.outputIndex
      )

      .txIn(tokenUtxo.input.txHash, tokenUtxo.input.outputIndex)

      .mintPlutusScriptV3()
      .mint("1", scripts.membershipIntent.mint.hash, "")
      .mintingScript(scripts.membershipIntent.mint.cbor)
      .mintRedeemerValue(redeemer)

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

    return { txHex, txIndex: 0 };
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
      project_url,
      fund_requested,
      receiver
    );
    const datum: ProposalDatum = proposalDatum(
      project_url,
      fund_requested,
      receiver
    );

    const txBuilder = await this.newValidationTx(true);
    txBuilder
      .readOnlyTxInReference(
        oracleUtxo.input.txHash,
        oracleUtxo.input.outputIndex
      )

      .txIn(tokenUtxo.input.txHash, tokenUtxo.input.outputIndex)

      .spendingPlutusScriptV3()
      .txIn(memberUtxo.input.txHash, memberUtxo.input.outputIndex)
      .txInRedeemerValue(memberProposeProject, "JSON")
      .txInScript(scripts.member.spend.cbor)
      .txInInlineDatumPresent()

      .mintPlutusScriptV3()
      .mint("1", scripts.proposeIntent.mint.hash, "")
      .mintingScript(scripts.proposeIntent.mint.cbor)
      .mintRedeemerValue(redeemer)

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

    const txHex = await txBuilder.complete();

    return { txHex, txIndex: 0 };
  };
}
