import {
  Layer1Tx,
  getCounterDatum,
  getMembershipIntentDatum,
  MemberDatum,
  memberDatum,
  CounterDatum,
  counterDatum,
  incrementCount,
  addMember,
  approveMember,
  rejectMember,
  getTokenAssetNameByPolicyId,
  adminRemoveMember,
  removeMember,
  approveProposal,
  mintProposal,
  rejectProposal,
  approveSignOff,
  mintSignOffApproval,
  Proposal,
  getProposalDatum,
  updateMemberDatum,
  adminSignOffProject,
  processSignOff,
  RotateAdmin,
  rotateAdmin,
  OracleDatum,
  updateOracleDatum,
  UpdateThreshold,
  updateThreshold,
  stopOracle,
  stopCounter,
  rBurn,
  IProvider,
  MembershipMetadata,
  membershipMetadata,
  CATConstants,
} from "../lib";
import { IWallet, stringToHex, UTxO } from "@meshsdk/core";

export class AdminActionTx extends Layer1Tx {
  constructor(
    public address: string,
    public userWallet: IWallet,
    public provider: IProvider,
    public catConstant: CATConstants
  ) {
    super(userWallet, address, provider, catConstant);
  }

  adminSignTx = async (unsignedTx: string) => {
    try {
      const signedTx = await this.wallet.signTx(unsignedTx, true);
      return signedTx;
    } catch (e) {
      console.error(e);
    }
  };

  adminSubmitTx = async (signedTx: string) => {
    try {
      const tx = await this.wallet.submitTx(signedTx);
      return tx;
    } catch (e) {
      console.error(e);
    }
  };

  // todo: handle multisig
  approveMember = async (
    oracleUtxo: UTxO,
    counterUtxo: UTxO,
    membershipIntentUtxo: UTxO,
    adminSigned: string[]
  ) => {
    const count = getCounterDatum(counterUtxo);
    const {
      policyId: tokenPolicyId,
      assetName: tokenAssetName,
      metadata: memberData,
    } = getMembershipIntentDatum(membershipIntentUtxo);

    const metadata: MembershipMetadata = membershipMetadata(
      memberData.walletAddress,
      memberData.fullName,
      memberData.displayName,
      memberData.emailAddress,
      memberData.bio
    );
    const newMemberDatum: MemberDatum = memberDatum(
      tokenPolicyId,
      tokenAssetName,
      new Map(),
      0,
      metadata
    );
    const updatedCounterDatum: CounterDatum = counterDatum(count + 1);

    try {
      const txBuilder = await this.newValidationTx(true);
      txBuilder
        .readOnlyTxInReference(
          oracleUtxo.input.txHash,
          oracleUtxo.input.outputIndex
        )

        .spendingPlutusScriptV3()
        .txIn(
          counterUtxo.input.txHash,
          counterUtxo.input.outputIndex,
          counterUtxo.output.amount,
          counterUtxo.output.address
        )
        .txInRedeemerValue(incrementCount, "JSON")
        .txInScript(this.catConstant.scripts.counter.spend.cbor)
        .txInInlineDatumPresent()

        .spendingPlutusScriptV3()
        .txIn(
          membershipIntentUtxo.input.txHash,
          membershipIntentUtxo.input.outputIndex,
          membershipIntentUtxo.output.amount,
          membershipIntentUtxo.output.address
        )
        .txInRedeemerValue("", "Mesh")
        .spendingTxInReference(
          this.catConstant.refTxInScripts.membershipIntent.spend.txHash,
          this.catConstant.refTxInScripts.membershipIntent.spend.outputIndex,
          (
            this.catConstant.scripts.membershipIntent.spend.cbor.length / 2
          ).toString(),
          this.catConstant.scripts.membershipIntent.spend.hash
        )
        .txInInlineDatumPresent()

        .mintPlutusScriptV3()
        .mint(
          "1",
          this.catConstant.scripts.member.mint.hash,
          stringToHex(count.toString())
        )
        .mintTxInReference(
          this.catConstant.refTxInScripts.member.mint.txHash,
          this.catConstant.refTxInScripts.member.mint.outputIndex,
          (this.catConstant.scripts.member.mint.cbor.length / 2).toString(),
          this.catConstant.scripts.member.mint.hash
        )
        .mintRedeemerValue(addMember, "JSON")

        .mintPlutusScriptV3()
        .mint("-1", this.catConstant.scripts.membershipIntent.mint.hash, "")
        .mintTxInReference(
          this.catConstant.refTxInScripts.membershipIntent.mint.txHash,
          this.catConstant.refTxInScripts.membershipIntent.mint.outputIndex,
          (
            this.catConstant.scripts.membershipIntent.mint.cbor.length / 2
          ).toString(),
          this.catConstant.scripts.membershipIntent.mint.hash
        )
        .mintRedeemerValue(approveMember, "JSON")

        .txOut(this.catConstant.scripts.counter.spend.address, [
          {
            unit: this.catConstant.scripts.counter.mint.hash,
            quantity: "1",
          },
        ])
        .txOutInlineDatumValue(updatedCounterDatum, "JSON")

        .txOut(this.catConstant.scripts.member.spend.address, [
          {
            unit:
              this.catConstant.scripts.member.mint.hash +
              stringToHex(count.toString()),
            quantity: "1",
          },
        ])
        .txOutInlineDatumValue(newMemberDatum, "JSON");

      for (const admin of adminSigned) {
        txBuilder.requiredSignerHash(admin);
      }
      const txHex = await txBuilder.complete();

      return { txHex, counterUtxoTxIndex: 0, memberUtxoTxIndex: 1 };
    } catch (e) {
      console.error(e);
    }
  };

  // todo: handle multisig
  rejectMember = async (
    oracleUtxo: UTxO,
    membershipIntentUtxo: UTxO,
    adminSigned: string[]
  ) => {
    const txBuilder = await this.newValidationTx(true);
    txBuilder
      .readOnlyTxInReference(
        oracleUtxo.input.txHash,
        oracleUtxo.input.outputIndex
      )

      .spendingPlutusScriptV3()
      .txIn(
        membershipIntentUtxo.input.txHash,
        membershipIntentUtxo.input.outputIndex,
        membershipIntentUtxo.output.amount,
        membershipIntentUtxo.output.address
      )
      .txInRedeemerValue("", "Mesh")
      .spendingTxInReference(
        this.catConstant.refTxInScripts.membershipIntent.spend.txHash,
        this.catConstant.refTxInScripts.membershipIntent.spend.outputIndex,
        (
          this.catConstant.scripts.membershipIntent.spend.cbor.length / 2
        ).toString(),
        this.catConstant.scripts.membershipIntent.spend.hash
      )
      .txInInlineDatumPresent()

      .mintPlutusScriptV3()
      .mint("-1", this.catConstant.scripts.membershipIntent.mint.hash, "")
      .mintTxInReference(
        this.catConstant.refTxInScripts.membershipIntent.mint.txHash,
        this.catConstant.refTxInScripts.membershipIntent.mint.outputIndex,
        (
          this.catConstant.scripts.membershipIntent.mint.cbor.length / 2
        ).toString(),
        this.catConstant.scripts.membershipIntent.mint.hash
      )
      .mintRedeemerValue(rejectMember, "JSON");

    for (const admin of adminSigned) {
      txBuilder.requiredSignerHash(admin);
    }

    const txHex = await txBuilder.complete();

    return { txHex };
  };

  // todo: handle multisig
  removeMember = async (
    oracleUtxo: UTxO,
    memberUtxo: UTxO,
    adminSigned: string[]
  ) => {
    const memberAssetName = getTokenAssetNameByPolicyId(
      memberUtxo,
      this.catConstant.scripts.member.mint.hash
    );

    const txBuilder = await this.newValidationTx(true);
    txBuilder
      .readOnlyTxInReference(
        oracleUtxo.input.txHash,
        oracleUtxo.input.outputIndex
      )

      .spendingPlutusScriptV3()
      .txIn(
        memberUtxo.input.txHash,
        memberUtxo.input.outputIndex,
        memberUtxo.output.amount,
        memberUtxo.output.address
      )
      .txInRedeemerValue(adminRemoveMember, "JSON")
      .spendingTxInReference(
        this.catConstant.refTxInScripts.member.spend.txHash,
        this.catConstant.refTxInScripts.member.spend.outputIndex,
        (this.catConstant.scripts.member.spend.cbor.length / 2).toString(),
        this.catConstant.scripts.member.spend.hash
      )
      .txInInlineDatumPresent()

      .mintPlutusScriptV3()
      .mint("-1", this.catConstant.scripts.member.mint.hash, memberAssetName)
      .mintTxInReference(
        this.catConstant.refTxInScripts.member.mint.txHash,
        this.catConstant.refTxInScripts.member.mint.outputIndex,
        (this.catConstant.scripts.member.mint.cbor.length / 2).toString(),
        this.catConstant.scripts.member.mint.hash
      )
      .mintRedeemerValue(removeMember, "JSON");

    for (const admin of adminSigned) {
      txBuilder.requiredSignerHash(admin);
    }

    const txHex = await txBuilder.complete();

    return { txHex };
  };

  // todo: handle multisig
  approveProposal = async (
    oracleUtxo: UTxO,
    proposeIntentUtxo: UTxO,
    adminSigned: string[]
  ) => {
    const proposeIntentAssetName = getTokenAssetNameByPolicyId(
      proposeIntentUtxo,
      this.catConstant.scripts.proposeIntent.mint.hash
    );

    try {
      const txBuilder = await this.newValidationTx(true);
      txBuilder
        .readOnlyTxInReference(
          oracleUtxo.input.txHash,
          oracleUtxo.input.outputIndex
        )

        .spendingPlutusScriptV3()
        .txIn(
          proposeIntentUtxo.input.txHash,
          proposeIntentUtxo.input.outputIndex,
          proposeIntentUtxo.output.amount,
          proposeIntentUtxo.output.address
        )
        .txInRedeemerValue("", "Mesh")
        .spendingTxInReference(
          this.catConstant.refTxInScripts.proposeIntent.spend.txHash,
          this.catConstant.refTxInScripts.proposeIntent.spend.outputIndex,
          (
            this.catConstant.scripts.proposeIntent.spend.cbor.length / 2
          ).toString(),
          this.catConstant.scripts.proposeIntent.spend.hash
        )
        .txInInlineDatumPresent()

        .mintPlutusScriptV3()
        .mint(
          "-1",
          this.catConstant.scripts.proposeIntent.mint.hash,
          proposeIntentAssetName
        )
        .mintTxInReference(
          this.catConstant.refTxInScripts.proposeIntent.mint.txHash,
          this.catConstant.refTxInScripts.proposeIntent.mint.outputIndex,
          (
            this.catConstant.scripts.proposeIntent.mint.cbor.length / 2
          ).toString(),
          this.catConstant.scripts.proposeIntent.mint.hash
        )
        .mintRedeemerValue(approveProposal, "JSON")

        .mintPlutusScriptV3()
        .mint(
          "1",
          this.catConstant.scripts.proposal.mint.hash,
          proposeIntentAssetName
        )
        .mintTxInReference(
          this.catConstant.refTxInScripts.proposal.mint.txHash,
          this.catConstant.refTxInScripts.proposal.mint.outputIndex,
          (this.catConstant.scripts.proposal.mint.cbor.length / 2).toString(),
          this.catConstant.scripts.proposal.mint.hash
        )
        .mintRedeemerValue(mintProposal, "JSON");

      if (proposeIntentUtxo.output.plutusData) {
        txBuilder
          .txOut(this.catConstant.scripts.proposal.spend.address, [
            {
              unit:
                this.catConstant.scripts.proposal.mint.hash +
                proposeIntentAssetName,
              quantity: "1",
            },
          ])
          .txOutInlineDatumValue(proposeIntentUtxo.output.plutusData, "CBOR");
      } else {
        txBuilder.txOut(this.catConstant.scripts.proposal.spend.address, [
          {
            unit:
              this.catConstant.scripts.proposal.mint.hash +
              proposeIntentAssetName,
            quantity: "1",
          },
        ]);
      }

      for (const admin of adminSigned) {
        txBuilder.requiredSignerHash(admin);
      }
      const txHex = await txBuilder.complete();

      return { txHex, txIndex: 0 };
    } catch (e) {
      console.error(e);
    }
  };

  // todo: handle multisig
  rejectProposal = async (
    oracleUtxo: UTxO,
    proposeIntentUtxo: UTxO,
    adminSigned: string[]
  ) => {
    const proposeIntentAssetName = getTokenAssetNameByPolicyId(
      proposeIntentUtxo,
      this.catConstant.scripts.proposeIntent.mint.hash
    );

    const txBuilder = await this.newValidationTx(true);
    txBuilder
      .readOnlyTxInReference(
        oracleUtxo.input.txHash,
        oracleUtxo.input.outputIndex
      )

      .spendingPlutusScriptV3()
      .txIn(
        proposeIntentUtxo.input.txHash,
        proposeIntentUtxo.input.outputIndex,
        proposeIntentUtxo.output.amount,
        proposeIntentUtxo.output.address
      )
      .txInRedeemerValue("", "Mesh")
      .spendingTxInReference(
        this.catConstant.refTxInScripts.proposeIntent.spend.txHash,
        this.catConstant.refTxInScripts.proposeIntent.spend.outputIndex,
        (
          this.catConstant.scripts.proposeIntent.spend.cbor.length / 2
        ).toString(),
        this.catConstant.scripts.proposeIntent.spend.hash
      )
      .txInInlineDatumPresent()

      .mintPlutusScriptV3()
      .mint(
        "-1",
        this.catConstant.scripts.proposeIntent.mint.hash,
        proposeIntentAssetName
      )
      .mintTxInReference(
        this.catConstant.refTxInScripts.proposeIntent.mint.txHash,
        this.catConstant.refTxInScripts.proposeIntent.mint.outputIndex,
        (
          this.catConstant.scripts.proposeIntent.mint.cbor.length / 2
        ).toString(),
        this.catConstant.scripts.proposeIntent.mint.hash
      )
      .mintRedeemerValue(rejectProposal, "JSON");

    for (const admin of adminSigned) {
      txBuilder.requiredSignerHash(admin);
    }

    const txHex = await txBuilder.complete();

    return { txHex };
  };

  // todo: handle multisig
  approveSignOff = async (
    oracleUtxo: UTxO,
    proposalUtxo: UTxO,
    adminSigned: string[]
  ) => {
    const proposalAssetName = getTokenAssetNameByPolicyId(
      proposalUtxo,
      this.catConstant.scripts.proposal.mint.hash
    );

    try {
      const txBuilder = await this.newValidationTx(true);
      txBuilder
        .readOnlyTxInReference(
          oracleUtxo.input.txHash,
          oracleUtxo.input.outputIndex
        )

        .spendingPlutusScriptV3()
        .txIn(proposalUtxo.input.txHash, proposalUtxo.input.outputIndex)
        .txInRedeemerValue("", "Mesh")
        .spendingTxInReference(
          this.catConstant.refTxInScripts.proposal.spend.txHash,
          this.catConstant.refTxInScripts.proposal.spend.outputIndex,
          (this.catConstant.scripts.proposal.spend.cbor.length / 2).toString(),
          this.catConstant.scripts.proposal.spend.hash
        )
        .txInInlineDatumPresent()

        .mintPlutusScriptV3()
        .mint(
          "-1",
          this.catConstant.scripts.proposal.mint.hash,
          proposalAssetName
        )
        .mintTxInReference(
          this.catConstant.refTxInScripts.proposal.mint.txHash,
          this.catConstant.refTxInScripts.proposal.mint.outputIndex,
          (this.catConstant.scripts.proposal.mint.cbor.length / 2).toString(),
          this.catConstant.scripts.proposal.mint.hash
        )
        .mintRedeemerValue(approveSignOff, "JSON")

        .mintPlutusScriptV3()
        .mint(
          "1",
          this.catConstant.scripts.signOffApproval.mint.hash,
          proposalAssetName
        )
        .mintTxInReference(
          this.catConstant.refTxInScripts.signOffApproval.mint.txHash,
          this.catConstant.refTxInScripts.signOffApproval.mint.outputIndex,
          (
            this.catConstant.scripts.signOffApproval.mint.cbor.length / 2
          ).toString(),
          this.catConstant.scripts.signOffApproval.mint.hash
        )
        .mintRedeemerValue(mintSignOffApproval, "JSON");

      if (proposalUtxo.output.plutusData) {
        txBuilder
          .txOut(this.catConstant.scripts.signOffApproval.spend.address, [
            {
              unit:
                this.catConstant.scripts.signOffApproval.mint.hash +
                proposalAssetName,
              quantity: "1",
            },
          ])
          .txOutInlineDatumValue(proposalUtxo.output.plutusData, "CBOR");
      } else {
        txBuilder.txOut(
          this.catConstant.scripts.signOffApproval.spend.address,
          [
            {
              unit:
                this.catConstant.scripts.signOffApproval.mint.hash +
                proposalAssetName,
              quantity: "1",
            },
          ]
        );
      }

      for (const admin of adminSigned) {
        txBuilder.requiredSignerHash(admin);
      }

      const txHex = await txBuilder.complete();

      return { txHex, txIndex: 0 };
    } catch (e) {
      console.error(e);
    }
  };

  SignOff = async (
    oracleUtxo: UTxO,
    signOffApprovalUtxo: UTxO,
    memberUtxo: UTxO
  ) => {
    const memberAssetName = getTokenAssetNameByPolicyId(
      memberUtxo,
      this.catConstant.scripts.member.mint.hash
    );
    const signOffApprovalAssetName = getTokenAssetNameByPolicyId(
      signOffApprovalUtxo,
      this.catConstant.scripts.signOffApproval.mint.hash
    );

    const proposal: Proposal = getProposalDatum(signOffApprovalUtxo);

    const updatedCounterDatum: MemberDatum = updateMemberDatum(
      memberUtxo,
      signOffApprovalUtxo
    );

    const { selectedUtxos, returnValue } = await this.getUtxosForWithdrawal([
      { unit: "lovelace", quantity: proposal.fundRequested.toString() },
    ]);

    try {
      const txBuilder = this.newTxBuilder(true);
      const { utxos } = await this.getWalletUtxos();
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
        .changeAddress(
          "addr_test1qzhm3fg7v9t9e4nrlw0z49cysmvzfy3xpmvxuht80aa3rvnm5tz7rfnph9ntszp2fclw5m334udzq49777gkhwkztsks4c69rg"
        )
        .selectUtxosFrom(utxos);

      txBuilder
        .readOnlyTxInReference(
          oracleUtxo.input.txHash,
          oracleUtxo.input.outputIndex
        )

        .spendingPlutusScriptV3()
        .txIn(
          signOffApprovalUtxo.input.txHash,
          signOffApprovalUtxo.input.outputIndex,
          signOffApprovalUtxo.output.amount,
          signOffApprovalUtxo.output.address
        )
        .txInRedeemerValue("", "Mesh")
        .spendingTxInReference(
          this.catConstant.refTxInScripts.signOffApproval.spend.txHash,
          this.catConstant.refTxInScripts.signOffApproval.spend.outputIndex,
          (
            this.catConstant.scripts.signOffApproval.spend.cbor.length / 2
          ).toString(),
          this.catConstant.scripts.signOffApproval.spend.hash
        )
        .txInInlineDatumPresent()

        .spendingPlutusScriptV3()
        .txIn(
          memberUtxo.input.txHash,
          memberUtxo.input.outputIndex,
          memberUtxo.output.amount,
          memberUtxo.output.address
        )
        .txInRedeemerValue(adminSignOffProject, "JSON")
        .spendingTxInReference(
          this.catConstant.refTxInScripts.member.spend.txHash,
          this.catConstant.refTxInScripts.member.spend.outputIndex,
          (this.catConstant.scripts.member.spend.cbor.length / 2).toString(),
          this.catConstant.scripts.member.spend.hash
        )
        .txInInlineDatumPresent()

        .mintPlutusScriptV3()
        .mint(
          "-1",
          this.catConstant.scripts.signOffApproval.mint.hash,
          signOffApprovalAssetName
        )
        .mintTxInReference(
          this.catConstant.refTxInScripts.signOffApproval.mint.txHash,
          this.catConstant.refTxInScripts.signOffApproval.mint.outputIndex,
          (
            this.catConstant.scripts.signOffApproval.mint.cbor.length / 2
          ).toString(),
          this.catConstant.scripts.signOffApproval.mint.hash
        )
        .mintRedeemerValue(processSignOff, "JSON")

        .txOut(proposal.receiver, [
          { unit: "lovelace", quantity: proposal.fundRequested.toString() },
        ])

        .txOut(this.catConstant.scripts.member.spend.address, [
          {
            unit: this.catConstant.scripts.member.mint.hash + memberAssetName,
            quantity: "1",
          },
        ])
        .txOutInlineDatumValue(updatedCounterDatum, "JSON")

        .withdrawalPlutusScriptV3()
        .withdrawal(this.catConstant.scripts.treasury.withdraw.address, "0")
        .withdrawalTxInReference(
          this.catConstant.refTxInScripts.treasury.withdrawal.txHash,
          this.catConstant.refTxInScripts.treasury.withdrawal.outputIndex,
          (
            this.catConstant.scripts.treasury.withdraw.cbor.length / 2
          ).toString(),
          this.catConstant.scripts.treasury.withdraw.hash
        )
        .withdrawalRedeemerValue("", "Mesh");

      for (const selectedUtxo of selectedUtxos) {
        txBuilder
          .spendingPlutusScriptV3()
          .txIn(
            selectedUtxo.input.txHash,
            selectedUtxo.input.outputIndex,
            selectedUtxo.output.amount,
            selectedUtxo.output.address,
            0
          )
          .txInRedeemerValue("", "Mesh")
          .txInInlineDatumPresent()
          .spendingTxInReference(
            this.catConstant.refTxInScripts.treasury.spend.txHash,
            this.catConstant.refTxInScripts.treasury.spend.outputIndex,
            (
              this.catConstant.scripts.treasury.spend.cbor.length / 2
            ).toString(),
            this.catConstant.scripts.treasury.spend.hash
          );
      }

      if (returnValue.length > 0) {
        txBuilder.txOut(
          this.catConstant.scripts.treasury.spend.address,
          returnValue
        );
      }

      const txHex = await txBuilder.complete();

      return { txHex, treasuryUtxoTxIndex: 0, memberUtxoTxIndex: 1 };
    } catch (e) {
      console.error(e);
    }
  };

  // todo: handle multisig
  rotateAdmin = async (
    oracleUtxo: UTxO,
    adminSigned: string[],
    newAdmins: string[],
    newAdminsTenure: string
  ) => {
    const redeemer: RotateAdmin = rotateAdmin(newAdmins, newAdminsTenure);

    const updatedOracleDatum: OracleDatum = updateOracleDatum(
      oracleUtxo,
      newAdmins,
      newAdminsTenure,
      null
    );

    const txBuilder = await this.newValidationTx(true);
    txBuilder
      .spendingPlutusScriptV3()
      .txIn(
        oracleUtxo.input.txHash,
        oracleUtxo.input.outputIndex,
        oracleUtxo.output.amount,
        oracleUtxo.output.address
      )
      .txInRedeemerValue(redeemer, "JSON")
      .txInScript(this.catConstant.scripts.oracle.spend.cbor)
      .txInInlineDatumPresent()

      .txOut(this.catConstant.scripts.oracle.spend.address, [
        {
          unit: this.catConstant.scripts.oracle.mint.hash,
          quantity: "1",
        },
      ])
      .txOutInlineDatumValue(updatedOracleDatum, "JSON");

    for (const admin of adminSigned) {
      txBuilder.requiredSignerHash(admin);
    }

    const txHex = await txBuilder.complete();

    return { txHex, txIndex: 0 };
  };

  // todo: handle multisig
  updateThreshold = async (
    oracleUtxo: UTxO,
    adminSigned: string[],
    newMultiSigThreshold: number
  ) => {
    const redeemer: UpdateThreshold = updateThreshold(newMultiSigThreshold);

    const updatedOracleDatum: OracleDatum = updateOracleDatum(
      oracleUtxo,
      null,
      null,
      newMultiSigThreshold
    );

    const txBuilder = await this.newValidationTx(true);
    txBuilder
      .spendingPlutusScriptV3()
      .txIn(
        oracleUtxo.input.txHash,
        oracleUtxo.input.outputIndex,
        oracleUtxo.output.amount,
        oracleUtxo.output.address
      )
      .txInRedeemerValue(redeemer, "JSON")
      .txInScript(this.catConstant.scripts.oracle.spend.cbor)
      .txInInlineDatumPresent()

      .txOut(this.catConstant.scripts.oracle.spend.address, [
        {
          unit: this.catConstant.scripts.oracle.mint.hash,
          quantity: "1",
        },
      ])
      .txOutInlineDatumValue(updatedOracleDatum, "JSON");

    for (const admin of adminSigned) {
      txBuilder.requiredSignerHash(admin);
    }

    const txHex = await txBuilder.complete();

    return { txHex, txIndex: 0 };
  };

  // todo: handle multisig
  stopOracle = async (oracleUtxo: UTxO, adminSigned: string[]) => {
    const updatedOracleDatum: OracleDatum = updateOracleDatum(
      oracleUtxo,
      [],
      null,
      null
    );

    const txBuilder = await this.newValidationTx(true);
    txBuilder
      .spendingPlutusScriptV3()
      .txIn(
        oracleUtxo.input.txHash,
        oracleUtxo.input.outputIndex,
        oracleUtxo.output.amount,
        oracleUtxo.output.address
      )
      .txInRedeemerValue(stopOracle, "JSON")
      .txInScript(this.catConstant.scripts.oracle.spend.cbor)
      .txInInlineDatumPresent()

      .txOut(this.catConstant.scripts.oracle.spend.address, [
        {
          unit: this.catConstant.scripts.oracle.mint.hash,
          quantity: "1",
        },
      ])
      .txOutInlineDatumValue(updatedOracleDatum, "JSON");

    for (const admin of adminSigned) {
      txBuilder.requiredSignerHash(admin);
    }

    const txHex = await txBuilder.complete();

    return { txHex, txIndex: 0 };
  };

  // todo: handle multisig
  stopCounter = async (counterUtxo: UTxO, adminSigned: string[]) => {
    const txBuilder = await this.newValidationTx(true);
    txBuilder
      .spendingPlutusScriptV3()
      .txIn(
        counterUtxo.input.txHash,
        counterUtxo.input.outputIndex,
        counterUtxo.output.amount,
        counterUtxo.output.address
      )
      .txInRedeemerValue(stopCounter, "JSON")
      .txInScript(this.catConstant.scripts.counter.spend.cbor)
      .txInInlineDatumPresent()

      .mintPlutusScriptV3()
      .mint("-1", this.catConstant.scripts.counter.mint.hash, "")
      .mintingScript(this.catConstant.scripts.counter.mint.cbor)
      .mintRedeemerValue(rBurn, "JSON");

    for (const admin of adminSigned) {
      txBuilder.requiredSignerHash(admin);
    }

    const txHex = await txBuilder.complete();

    return { txHex };
  };
}
