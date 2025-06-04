import {
  Layer1Tx,
  getCounterDatum,
  getMembershipIntentDatum,
  MemberDatum,
  memberDatum,
  CounterDatum,
  counterDatum,
  incrementCount,
  scripts,
  addMember,
  approveMember,
  minUtxos,
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
  ref_tx_in_scripts,
  IProvider,
  Network,
  MembershipMetadata,
  membershipMetadata,
} from "../lib";
import { IWallet, stringToHex, UTxO } from "@meshsdk/core";

export class AdminActionTx extends Layer1Tx {
  constructor(
    public address: string,
    public userWallet: IWallet,
    public provider: IProvider,
    public network: Network = "preprod"
  ) {
    super(userWallet, address, provider, network);
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
    admin_signed: string[]
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
    const new_member_datum: MemberDatum = memberDatum(
      tokenPolicyId,
      tokenAssetName,
      new Map(),
      0,
      metadata
    );
    const updated_counter_datum: CounterDatum = counterDatum(count + 1);

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
        .txInScript(scripts.counter.spend.cbor)
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
          ref_tx_in_scripts.membershipIntent.spend.txHash,
          ref_tx_in_scripts.membershipIntent.spend.outputIndex,
          (scripts.membershipIntent.spend.cbor.length / 2).toString(),
          scripts.membershipIntent.spend.hash
        )
        .txInInlineDatumPresent()

        .mintPlutusScriptV3()
        .mint("1", scripts.member.mint.hash, stringToHex(count.toString()))
        .mintTxInReference(
          ref_tx_in_scripts.member.mint.txHash,
          ref_tx_in_scripts.member.mint.outputIndex,
          (scripts.member.mint.cbor.length / 2).toString(),
          scripts.member.mint.hash
        )
        .mintRedeemerValue(addMember, "JSON")

        .mintPlutusScriptV3()
        .mint("-1", scripts.membershipIntent.mint.hash, "")
        .mintTxInReference(
          ref_tx_in_scripts.membershipIntent.mint.txHash,
          ref_tx_in_scripts.membershipIntent.mint.outputIndex,
          (scripts.membershipIntent.mint.cbor.length / 2).toString(),
          scripts.membershipIntent.mint.hash
        )
        .mintRedeemerValue(approveMember, "JSON")

        .txOut(scripts.counter.spend.address, [
          { unit: "lovelace", quantity: minUtxos.counter },
          {
            unit: scripts.counter.mint.hash,
            quantity: "1",
          },
        ])
        .txOutInlineDatumValue(updated_counter_datum, "JSON")

        .txOut(scripts.member.spend.address, [
          { unit: "lovelace", quantity: minUtxos.member },
          {
            unit: scripts.member.mint.hash + stringToHex(count.toString()),
            quantity: "1",
          },
        ])
        .txOutInlineDatumValue(new_member_datum, "JSON");

      for (const admin of admin_signed) {
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
    admin_signed: string[]
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
        ref_tx_in_scripts.membershipIntent.spend.txHash,
        ref_tx_in_scripts.membershipIntent.spend.outputIndex,
        (scripts.membershipIntent.spend.cbor.length / 2).toString(),
        scripts.membershipIntent.spend.hash
      )
      .txInInlineDatumPresent()

      .mintPlutusScriptV3()
      .mint("-1", scripts.membershipIntent.mint.hash, "")
      .mintTxInReference(
        ref_tx_in_scripts.membershipIntent.mint.txHash,
        ref_tx_in_scripts.membershipIntent.mint.outputIndex,
        (scripts.membershipIntent.mint.cbor.length / 2).toString(),
        scripts.membershipIntent.mint.hash
      )
      .mintRedeemerValue(rejectMember, "JSON");

    for (const admin of admin_signed) {
      txBuilder.requiredSignerHash(admin);
    }

    const txHex = await txBuilder.complete();

    return { txHex };
  };

  // todo: handle multisig
  removeMember = async (
    oracleUtxo: UTxO,
    memberUtxo: UTxO,
    admin_signed: string[]
  ) => {
    const memberAssetName = getTokenAssetNameByPolicyId(
      memberUtxo,
      scripts.member.mint.hash
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
        ref_tx_in_scripts.member.spend.txHash,
        ref_tx_in_scripts.member.spend.outputIndex,
        (scripts.member.spend.cbor.length / 2).toString(),
        scripts.member.spend.hash
      )
      .txInInlineDatumPresent()

      .mintPlutusScriptV3()
      .mint("-1", scripts.member.mint.hash, memberAssetName)
      .mintTxInReference(
        ref_tx_in_scripts.member.mint.txHash,
        ref_tx_in_scripts.member.mint.outputIndex,
        (scripts.member.mint.cbor.length / 2).toString(),
        scripts.member.mint.hash
      )
      .mintRedeemerValue(removeMember, "JSON");

    for (const admin of admin_signed) {
      txBuilder.requiredSignerHash(admin);
    }

    const txHex = await txBuilder.complete();

    return { txHex };
  };

  // todo: handle multisig
  approveProposal = async (
    oracleUtxo: UTxO,
    proposeIntentUtxo: UTxO,
    admin_signed: string[]
  ) => {
    const proposeIntentAssetName = getTokenAssetNameByPolicyId(
      proposeIntentUtxo,
      scripts.proposeIntent.mint.hash
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
          ref_tx_in_scripts.proposeIntent.spend.txHash,
          ref_tx_in_scripts.proposeIntent.spend.outputIndex,
          (scripts.proposeIntent.spend.cbor.length / 2).toString(),
          scripts.proposeIntent.spend.hash
        )
        .txInInlineDatumPresent()

        .mintPlutusScriptV3()
        .mint("-1", scripts.proposeIntent.mint.hash, proposeIntentAssetName)
        .mintTxInReference(
          ref_tx_in_scripts.proposeIntent.mint.txHash,
          ref_tx_in_scripts.proposeIntent.mint.outputIndex,
          (scripts.proposeIntent.mint.cbor.length / 2).toString(),
          scripts.proposeIntent.mint.hash
        )
        .mintRedeemerValue(approveProposal, "JSON")

        .mintPlutusScriptV3()
        .mint("1", scripts.proposal.mint.hash, proposeIntentAssetName)
        .mintTxInReference(
          ref_tx_in_scripts.proposal.mint.txHash,
          ref_tx_in_scripts.proposal.mint.outputIndex,
          (scripts.proposal.mint.cbor.length / 2).toString(),
          scripts.proposal.mint.hash
        )
        .mintRedeemerValue(mintProposal, "JSON");

      if (proposeIntentUtxo.output.plutusData) {
        txBuilder
          .txOut(scripts.proposal.spend.address, [
            { unit: "lovelace", quantity: minUtxos.proposal },
            {
              unit: scripts.proposal.mint.hash + proposeIntentAssetName,
              quantity: "1",
            },
          ])
          .txOutInlineDatumValue(proposeIntentUtxo.output.plutusData, "CBOR");
      } else {
        txBuilder.txOut(scripts.proposal.spend.address, [
          { unit: "lovelace", quantity: minUtxos.proposal },
          {
            unit: scripts.proposal.mint.hash + proposeIntentAssetName,
            quantity: "1",
          },
        ]);
      }

      for (const admin of admin_signed) {
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
    admin_signed: string[]
  ) => {
    const proposeIntentAssetName = getTokenAssetNameByPolicyId(
      proposeIntentUtxo,
      scripts.proposeIntent.mint.hash
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
        ref_tx_in_scripts.proposeIntent.spend.txHash,
        ref_tx_in_scripts.proposeIntent.spend.outputIndex,
        (scripts.proposeIntent.spend.cbor.length / 2).toString(),
        scripts.proposeIntent.spend.hash
      )
      .txInInlineDatumPresent()

      .mintPlutusScriptV3()
      .mint("-1", scripts.proposeIntent.mint.hash, proposeIntentAssetName)
      .mintTxInReference(
        ref_tx_in_scripts.proposeIntent.mint.txHash,
        ref_tx_in_scripts.proposeIntent.mint.outputIndex,
        (scripts.proposeIntent.mint.cbor.length / 2).toString(),
        scripts.proposeIntent.mint.hash
      )
      .mintRedeemerValue(rejectProposal, "JSON");

    for (const admin of admin_signed) {
      txBuilder.requiredSignerHash(admin);
    }

    const txHex = await txBuilder.complete();

    return { txHex };
  };

  // todo: handle multisig
  approveSignOff = async (
    oracleUtxo: UTxO,
    proposalUtxo: UTxO,
    admin_signed: string[]
  ) => {
    const proposalAssetName = getTokenAssetNameByPolicyId(
      proposalUtxo,
      scripts.proposal.mint.hash
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
          ref_tx_in_scripts.proposal.spend.txHash,
          ref_tx_in_scripts.proposal.spend.outputIndex,
          (scripts.proposal.spend.cbor.length / 2).toString(),
          scripts.proposal.spend.hash
        )
        .txInInlineDatumPresent()

        .mintPlutusScriptV3()
        .mint("-1", scripts.proposal.mint.hash, proposalAssetName)
        .mintTxInReference(
          ref_tx_in_scripts.proposal.mint.txHash,
          ref_tx_in_scripts.proposal.mint.outputIndex,
          (scripts.proposal.mint.cbor.length / 2).toString(),
          scripts.proposal.mint.hash
        )
        .mintRedeemerValue(approveSignOff, "JSON")

        .mintPlutusScriptV3()
        .mint("1", scripts.signOffApproval.mint.hash, proposalAssetName)
        .mintTxInReference(
          ref_tx_in_scripts.signOffApproval.mint.txHash,
          ref_tx_in_scripts.signOffApproval.mint.outputIndex,
          (scripts.signOffApproval.mint.cbor.length / 2).toString(),
          scripts.signOffApproval.mint.hash
        )
        .mintRedeemerValue(mintSignOffApproval, "JSON");

      if (proposalUtxo.output.plutusData) {
        txBuilder
          .txOut(scripts.signOffApproval.spend.address, [
            { unit: "lovelace", quantity: minUtxos.signOffApproval },
            {
              unit: scripts.signOffApproval.mint.hash + proposalAssetName,
              quantity: "1",
            },
          ])
          .txOutInlineDatumValue(proposalUtxo.output.plutusData, "CBOR");
      } else {
        txBuilder.txOut(scripts.signOffApproval.spend.address, [
          { unit: "lovelace", quantity: minUtxos.signOffApproval },
          {
            unit: scripts.signOffApproval.mint.hash + proposalAssetName,
            quantity: "1",
          },
        ]);
      }

      for (const admin of admin_signed) {
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
      scripts.member.mint.hash
    );
    const signOffApprovalAssetName = getTokenAssetNameByPolicyId(
      signOffApprovalUtxo,
      scripts.signOffApproval.mint.hash
    );

    const proposal: Proposal = getProposalDatum(signOffApprovalUtxo);

    const updated_member_datum: MemberDatum = updateMemberDatum(
      memberUtxo,
      signOffApprovalUtxo
    );

    const { selectedUtxos, returnValue } = await this.getUtxosForWithdrawal([
      { unit: "lovelace", quantity: proposal.fund_requested.toString() },
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
          ref_tx_in_scripts.signOffApproval.spend.txHash,
          ref_tx_in_scripts.signOffApproval.spend.outputIndex,
          (scripts.signOffApproval.spend.cbor.length / 2).toString(),
          scripts.signOffApproval.spend.hash
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
          ref_tx_in_scripts.member.spend.txHash,
          ref_tx_in_scripts.member.spend.outputIndex,
          (scripts.member.spend.cbor.length / 2).toString(),
          scripts.member.spend.hash
        )
        .txInInlineDatumPresent()

        .mintPlutusScriptV3()
        .mint("-1", scripts.signOffApproval.mint.hash, signOffApprovalAssetName)
        .mintTxInReference(
          ref_tx_in_scripts.signOffApproval.mint.txHash,
          ref_tx_in_scripts.signOffApproval.mint.outputIndex,
          (scripts.signOffApproval.mint.cbor.length / 2).toString(),
          scripts.signOffApproval.mint.hash
        )
        .mintRedeemerValue(processSignOff, "JSON")

        .txOut(proposal.receiver, [
          { unit: "lovelace", quantity: proposal.fund_requested.toString() },
        ])

        .txOut(scripts.member.spend.address, [
          { unit: "lovelace", quantity: minUtxos.member },
          {
            unit: scripts.member.mint.hash + memberAssetName,
            quantity: "1",
          },
        ])
        .txOutInlineDatumValue(updated_member_datum, "JSON")

        .withdrawalPlutusScriptV3()
        .withdrawal(scripts.treasury.withdraw.address, "0")
        .withdrawalTxInReference(
          ref_tx_in_scripts.treasury.withdrawal.txHash,
          ref_tx_in_scripts.treasury.withdrawal.outputIndex,
          (scripts.treasury.withdraw.cbor.length / 2).toString(),
          scripts.treasury.withdraw.hash
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
            ref_tx_in_scripts.treasury.spend.txHash,
            ref_tx_in_scripts.treasury.spend.outputIndex,
            (scripts.treasury.spend.cbor.length / 2).toString(),
            scripts.treasury.spend.hash
          );
      }

      if (returnValue.length > 0) {
        txBuilder.txOut(scripts.treasury.spend.address, returnValue);
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
    admin_signed: string[],
    new_admins: string[],
    new_admin_tenure: string
  ) => {
    const redeemer: RotateAdmin = rotateAdmin(new_admins, new_admin_tenure);

    const updated_oracle_datum: OracleDatum = updateOracleDatum(
      oracleUtxo,
      new_admins,
      new_admin_tenure,
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
      .txInScript(scripts.oracle.spend.cbor)
      .txInInlineDatumPresent()

      .txOut(scripts.oracle.spend.address, [
        { unit: "lovelace", quantity: minUtxos.oracle },
        {
          unit: scripts.oracle.mint.hash,
          quantity: "1",
        },
      ])
      .txOutInlineDatumValue(updated_oracle_datum, "JSON");

    for (const admin of admin_signed) {
      txBuilder.requiredSignerHash(admin);
    }

    const txHex = await txBuilder.complete();

    return { txHex, txIndex: 0 };
  };

  // todo: handle multisig
  updateThreshold = async (
    oracleUtxo: UTxO,
    admin_signed: string[],
    new_multi_sig_threshold: number
  ) => {
    const redeemer: UpdateThreshold = updateThreshold(new_multi_sig_threshold);

    const updated_oracle_datum: OracleDatum = updateOracleDatum(
      oracleUtxo,
      null,
      null,
      new_multi_sig_threshold
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
      .txInScript(scripts.oracle.spend.cbor)
      .txInInlineDatumPresent()

      .txOut(scripts.oracle.spend.address, [
        { unit: "lovelace", quantity: minUtxos.oracle },
        {
          unit: scripts.oracle.mint.hash,
          quantity: "1",
        },
      ])
      .txOutInlineDatumValue(updated_oracle_datum, "JSON");

    for (const admin of admin_signed) {
      txBuilder.requiredSignerHash(admin);
    }

    const txHex = await txBuilder.complete();

    return { txHex, txIndex: 0 };
  };

  // todo: handle multisig
  stopOracle = async (oracleUtxo: UTxO, admin_signed: string[]) => {
    const updated_oracle_datum: OracleDatum = updateOracleDatum(
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
      .txInScript(scripts.oracle.spend.cbor)
      .txInInlineDatumPresent()

      .txOut(scripts.oracle.spend.address, [
        { unit: "lovelace", quantity: minUtxos.oracle },
        {
          unit: scripts.oracle.mint.hash,
          quantity: "1",
        },
      ])
      .txOutInlineDatumValue(updated_oracle_datum, "JSON");

    for (const admin of admin_signed) {
      txBuilder.requiredSignerHash(admin);
    }

    const txHex = await txBuilder.complete();

    return { txHex, txIndex: 0 };
  };

  // todo: handle multisig
  stopCounter = async (counterUtxo: UTxO, admin_signed: string[]) => {
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
      .txInScript(scripts.counter.spend.cbor)
      .txInInlineDatumPresent()

      .mintPlutusScriptV3()
      .mint("-1", scripts.counter.mint.hash, "")
      .mintingScript(scripts.counter.mint.cbor)
      .mintRedeemerValue(rBurn, "JSON");

    for (const admin of admin_signed) {
      txBuilder.requiredSignerHash(admin);
    }

    const txHex = await txBuilder.complete();

    return { txHex };
  };
}
