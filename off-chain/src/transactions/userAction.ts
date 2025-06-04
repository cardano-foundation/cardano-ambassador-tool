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
  IProvider,
  Network,
  MembershipMetadata,
  membershipMetadata,
  ProposalMetadata,
  proposalMetadata,
  getTokenAssetNameByPolicyId,
  computeProposalMetadataHash,
} from "../lib";
import { IWallet, stringToHex, UTxO } from "@meshsdk/core";

export class UserActionTx extends Layer1Tx {
  constructor(
    public address: string,
    public userWallet: IWallet,
    public provider: IProvider,
    public network: Network = "preprod"
  ) {
    super(userWallet, address, provider, network);
  }

  applyMembership = async (
    oracleUtxo: UTxO,
    tokenUtxo: UTxO,
    tokenPolicyId: string,
    tokenAssetName: string,
    walletAddress: string,
    fullName: string,
    displayName: string,
    emailAddress: string,
    bio: string
  ) => {
    const metadata: MembershipMetadata = membershipMetadata(
      stringToHex(walletAddress),
      stringToHex(fullName),
      stringToHex(displayName),
      stringToHex(emailAddress),
      stringToHex(bio)
    );
    const redeemer: ApplyMembership = applyMembership(
      tokenPolicyId,
      tokenAssetName, // todo: stringToHex tbc
      metadata
    );
    const datum: MembershipIntentDatum = membershipIntentDatum(
      tokenPolicyId,
      tokenAssetName, // todo: stringToHex tbc
      metadata
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
    fund_requested: number,
    receiver: string,
    project_details: string
  ) => {
    const metadata: ProposalMetadata = proposalMetadata(
      stringToHex(project_details)
    );
    const memberAssetName = getTokenAssetNameByPolicyId(
      memberUtxo,
      scripts.member.mint.hash
    );
    const redeemer: ProposeProject = proposeProject(
      fund_requested,
      receiver,
      Number(memberAssetName),
      metadata
    );
    const datum: ProposalDatum = proposalDatum(
      fund_requested,
      receiver,
      Number(memberAssetName),
      metadata
    );
    const intentAssetName = computeProposalMetadataHash(metadata);

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
        .mint("1", scripts.proposeIntent.mint.hash, intentAssetName)
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

      const txHex = await txBuilder.complete();
      const signedTx = await this.wallet.signTx(txHex);
      await this.wallet.submitTx(signedTx);

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
