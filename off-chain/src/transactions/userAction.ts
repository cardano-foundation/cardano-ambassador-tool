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
  IProvider,
  MembershipMetadata,
  membershipMetadata,
  ProposalMetadata,
  proposalMetadata,
  getTokenAssetNameByPolicyId,
  computeProposalMetadataHash,
  CATConstants,
  updateMembershipIntentMetadata,
  getMembershipIntentDatum,
  MemberDatum,
  memberDatum,
  getMemberDatum,
  memberUpdateMetadata,
} from "../../../off-chain/src/lib";
import { hexToString, IWallet, stringToHex, UTxO } from "@meshsdk/core";

export class UserActionTx extends Layer1Tx {
  constructor(
    public address: string,
    public userWallet: IWallet,
    public provider: IProvider,
    public catConstant: CATConstants
  ) {
    super(userWallet, address, provider, catConstant);
  }

  /**
   *
   * @param oracleUtxo
   * @param tokenUtxo
   * @param tokenPolicyId
   * @param tokenAssetName assetName in hex
   * @param walletAddress address in bech32
   * @param fullName
   * @param displayName
   * @param emailAddress
   * @param bio
   * @returns
   */
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
      walletAddress,
      stringToHex(fullName),
      stringToHex(displayName),
      stringToHex(emailAddress),
      stringToHex(bio)
    );
    const redeemer: ApplyMembership = applyMembership(
      tokenPolicyId,
      tokenAssetName,
      metadata
    );
    const datum: MembershipIntentDatum = membershipIntentDatum(
      tokenPolicyId,
      tokenAssetName,
      metadata
    );

    try {
      const txBuilder = await this.newValidationTx();
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
      console.log(txHex);

      const signedTx = await this.wallet.signTx(txHex, true);
      await this.wallet.submitTx(signedTx);

      return { txHex, txIndex: 0 };
    } catch (e) {
      console.error(e);
    }
  };

  /**
   *
   * @param oracleUtxo
   * @param tokenUtxo
   * @param tokenPolicyId
   * @param tokenAssetName
   * @param walletAddress
   * @param fullName
   * @param displayName
   * @param emailAddress
   * @param bio
   * @returns
   */
  updateMembershipIntentMetadata = async (
    oracleUtxo: UTxO,
    tokenUtxo: UTxO,
    membershipIntentUtxo: UTxO,
    walletAddress: string,
    fullName: string,
    displayName: string,
    emailAddress: string,
    bio: string
  ) => {
    const metadata: MembershipMetadata = membershipMetadata(
      walletAddress,
      stringToHex(fullName),
      stringToHex(displayName),
      stringToHex(emailAddress),
      stringToHex(bio)
    );
    const { policyId: intentPolicyId, assetName: intentAssetName } =
      getMembershipIntentDatum(membershipIntentUtxo);
    const updatedIntentDatum: MembershipIntentDatum = membershipIntentDatum(
      intentPolicyId,
      intentAssetName,
      metadata
    );

    try {
      const txBuilder = await this.newValidationTx();
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
          membershipIntentUtxo.input.txHash,
          membershipIntentUtxo.input.outputIndex,
          membershipIntentUtxo.output.amount,
          membershipIntentUtxo.output.address
        )
        .txInRedeemerValue(updateMembershipIntentMetadata, "JSON")
        .spendingTxInReference(
          this.catConstant.refTxInScripts.membershipIntent.spend.txHash,
          this.catConstant.refTxInScripts.membershipIntent.spend.outputIndex,
          (
            this.catConstant.scripts.membershipIntent.spend.cbor.length / 2
          ).toString(),
          this.catConstant.scripts.membershipIntent.spend.hash
        )
        .txInInlineDatumPresent()

        .txOut(this.catConstant.scripts.membershipIntent.spend.address, [
          {
            unit: this.catConstant.scripts.membershipIntent.mint.hash,
            quantity: "1",
          },
        ])
        .txOutInlineDatumValue(updatedIntentDatum, "JSON");

      if (tokenUtxo.output.plutusData) {
        txBuilder
          .txOut(tokenUtxo.output.address, tokenUtxo.output.amount)
          .txOutInlineDatumValue(tokenUtxo.output.plutusData, "CBOR");
      } else {
        txBuilder.txOut(tokenUtxo.output.address, tokenUtxo.output.amount);
      }

      const txHex = await txBuilder.complete();
      console.log(txHex);

      const signedTx = await this.wallet.signTx(txHex, true);
      await this.wallet.submitTx(signedTx);

      return { txHex, membershipIntentUtxoTxIndex: 0, userTokenUtxoTxIndex: 1 };
    } catch (e) {
      console.error(e);
    }
  };

  /**
   *
   * @param oracleUtxo
   * @param memberUtxo
   * @param tokenUtxo
   * @param walletAddress
   * @param fullName
   * @param displayName
   * @param emailAddress
   * @param bio
   * @returns
   */
  updateMemberMetadata = async (
    oracleUtxo: UTxO,
    memberUtxo: UTxO,
    tokenUtxo: UTxO,
    walletAddress: string,
    fullName: string,
    displayName: string,
    emailAddress: string,
    bio: string
  ) => {
    const memberAssetName = getTokenAssetNameByPolicyId(
      memberUtxo,
      this.catConstant.scripts.member.mint.hash
    );
    const metadata: MembershipMetadata = membershipMetadata(
      walletAddress,
      stringToHex(fullName),
      stringToHex(displayName),
      stringToHex(emailAddress),
      stringToHex(bio)
    );
    const {
      token: memberToken,
      completion,
      fundReceived,
    } = getMemberDatum(memberUtxo);
    const updatedMemberDatum: MemberDatum = memberDatum(
      memberToken.policyId,
      memberToken.assetName,
      completion,
      fundReceived,
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

        .spendingPlutusScriptV3()
        .txIn(
          memberUtxo.input.txHash,
          memberUtxo.input.outputIndex,
          memberUtxo.output.amount,
          memberUtxo.output.address
        )
        .txInRedeemerValue(memberUpdateMetadata, "JSON")
        .spendingTxInReference(
          this.catConstant.refTxInScripts.member.spend.txHash,
          this.catConstant.refTxInScripts.member.spend.outputIndex,
          (this.catConstant.scripts.member.spend.cbor.length / 2).toString(),
          this.catConstant.scripts.member.spend.hash
        )
        .txInInlineDatumPresent()

        .txOut(this.catConstant.scripts.member.spend.address, [
          {
            unit: this.catConstant.scripts.member.mint.hash + memberAssetName,
            quantity: "1",
          },
        ])
        .txOutInlineDatumValue(updatedMemberDatum, "JSON");

      if (tokenUtxo.output.plutusData) {
        txBuilder
          .txOut(tokenUtxo.output.address, tokenUtxo.output.amount)
          .txOutInlineDatumValue(tokenUtxo.output.plutusData, "CBOR");
      } else {
        txBuilder.txOut(tokenUtxo.output.address, tokenUtxo.output.amount);
      }

      const txHex = await txBuilder.complete();
      console.log(txHex);

      const signedTx = await this.wallet.signTx(txHex, true);
      await this.wallet.submitTx(signedTx);

      return { txHex, memberUtxoTxIndex: 0, userTokenUtxoTxIndex: 1 };
    } catch (e) {
      console.error(e);
    }
  };

  /**
   *
   * @param oracleUtxo
   * @param tokenUtxo
   * @param memberUtxo
   * @param fundRequested value in lovelace
   * @param receiver address in bech32
   * @param projectDetails
   * @returns
   */
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
    const memberAssetName = hexToString(
      getTokenAssetNameByPolicyId(
        memberUtxo,
        this.catConstant.scripts.member.mint.hash
      )
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
        .readOnlyTxInReference(
          memberUtxo.input.txHash,
          memberUtxo.input.outputIndex
        )
        .txIn(
          tokenUtxo.input.txHash,
          tokenUtxo.input.outputIndex,
          tokenUtxo.output.amount,
          tokenUtxo.output.address
        )

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
            unit:
              this.catConstant.scripts.proposeIntent.mint.hash +
              intentAssetName,
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
      console.log(txHex);

      const signedTx = await this.wallet.signTx(txHex, true);
      await this.wallet.submitTx(signedTx);

      return {
        txHex,
        proposeIntentUtxoTxIndex: 0,
        tokenUtxoTxIndex: 1,
      };
    } catch (e) {
      console.error(e);
    }
  };
}
