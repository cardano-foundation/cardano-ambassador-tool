import {
  Layer1Tx,
  ApplyMembership,
  applyMembership,
  MembershipIntentDatum,
  membershipIntentDatum,
  ProposeProject,
  proposeProject,
  ProposalDatum,
  proposalDatum,
  memberProposeProject,
  IProvider,
  MembershipMetadata,
  membershipMetadata,
  ProposalMetadata,
  proposalMetadata,
  getTokenAssetNameByPolicyId,
  computeProposalMetadataHash,
  CATConstants,
} from "../lib";
import { IWallet, stringToHex, UTxO } from "@meshsdk/core";

export class UserActionTx extends Layer1Tx {
  constructor(
    public address: string,
    public userWallet: IWallet,
    public provider: IProvider,
    public catConstant: CATConstants
  ) {
    super(userWallet, address, provider, catConstant);
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
        .mint("1", this.catConstant.scripts.membershipIntent.mint.hash, "")
        .mintTxInReference(
          this.catConstant.refTxInScripts.membershipIntent.mint.txHash,
          this.catConstant.refTxInScripts.membershipIntent.mint.outputIndex,
          (
            this.catConstant.scripts.membershipIntent.mint.cbor.length / 2
          ).toString(),
          this.catConstant.scripts.membershipIntent.mint.hash
        )
        .mintRedeemerValue(redeemer, "JSON")

        .txOut(this.catConstant.scripts.membershipIntent.spend.address, [
          {
            unit: this.catConstant.scripts.membershipIntent.mint.hash,
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
    fundRequested: number,
    receiver: string,
    projectDetails: string
  ) => {
    const metadata: ProposalMetadata = proposalMetadata(
      stringToHex(projectDetails)
    );
    const memberAssetName = getTokenAssetNameByPolicyId(
      memberUtxo,
      this.catConstant.scripts.member.mint.hash
    );
    const redeemer: ProposeProject = proposeProject(
      fundRequested,
      receiver,
      Number(memberAssetName),
      metadata
    );
    const datum: ProposalDatum = proposalDatum(
      fundRequested,
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
          this.catConstant.refTxInScripts.member.spend.txHash,
          this.catConstant.refTxInScripts.member.spend.outputIndex,
          (this.catConstant.scripts.member.spend.cbor.length / 2).toString(),
          this.catConstant.scripts.member.spend.hash
        )
        .txInInlineDatumPresent()

        .mintPlutusScriptV3()
        .mint(
          "1",
          this.catConstant.scripts.proposeIntent.mint.hash,
          intentAssetName
        )
        .mintTxInReference(
          this.catConstant.refTxInScripts.proposeIntent.mint.txHash,
          this.catConstant.refTxInScripts.proposeIntent.mint.outputIndex,
          (
            this.catConstant.scripts.proposeIntent.mint.cbor.length / 2
          ).toString(),
          this.catConstant.scripts.proposeIntent.mint.hash
        )
        .mintRedeemerValue(redeemer, "JSON")

        .txOut(this.catConstant.scripts.proposeIntent.spend.address, [
          {
            unit: this.catConstant.scripts.proposeIntent.mint.hash,
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
