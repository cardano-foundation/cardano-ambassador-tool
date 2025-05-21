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
} from "@/lib";
import { IWallet, stringToHex, UTxO } from "@meshsdk/core";

export class AdminActionTx extends Layer1Tx {
  constructor(address: string, userWallet: IWallet) {
    super(userWallet, address);
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
    const tx = await this.wallet.submitTx(signedTx);
    return tx;
  };

  // todo: handle multisig
  approveMember = async (
    oracleUtxo: UTxO,
    counterUtxo: UTxO,
    membershipIntentUtxo: UTxO,
    admin_signed: string[]
  ) => {
    const count = getCounterDatum(oracleUtxo);
    const { policyId: tokenPolicyId, assetName: tokenAssetName } =
      getMembershipIntentDatum(membershipIntentUtxo);

    const new_member_datum: MemberDatum = memberDatum(
      tokenPolicyId,
      tokenAssetName,
      new Map(),
      0
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

      console.log(txHex);

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
      .txInRedeemerValue("", "JSON")
      .txInScript(scripts.membershipIntent.spend.cbor)
      .txInInlineDatumPresent()

      .mintPlutusScriptV3()
      .mint("-1", scripts.membershipIntent.mint.hash, "")
      .mintingScript(scripts.membershipIntent.mint.cbor)
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
      .txInScript(scripts.member.spend.cbor)
      .txInInlineDatumPresent()

      .mintPlutusScriptV3()
      .mint("-1", scripts.member.mint.hash, memberAssetName)
      .mintingScript(scripts.member.mint.cbor)
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
      .txInRedeemerValue("", "JSON")
      .txInScript(scripts.proposeIntent.spend.cbor)
      .txInInlineDatumPresent()

      .mintPlutusScriptV3()
      .mint("-1", scripts.proposeIntent.mint.hash, proposeIntentAssetName)
      .mintingScript(scripts.proposeIntent.mint.cbor)
      .mintRedeemerValue(approveProposal, "JSON")

      .mintPlutusScriptV3()
      .mint("1", scripts.proposal.mint.hash, proposeIntentAssetName)
      .mintingScript(scripts.proposal.mint.cbor)
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
      .txInRedeemerValue("", "JSON")
      .txInScript(scripts.proposeIntent.spend.cbor)
      .txInInlineDatumPresent()

      .mintPlutusScriptV3()
      .mint("-1", scripts.proposeIntent.mint.hash, proposeIntentAssetName)
      .mintingScript(scripts.proposeIntent.mint.cbor)
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

    const txBuilder = await this.newValidationTx(true);
    txBuilder
      .readOnlyTxInReference(
        oracleUtxo.input.txHash,
        oracleUtxo.input.outputIndex
      )

      .spendingPlutusScriptV3()
      .txIn(proposalUtxo.input.txHash, proposalUtxo.input.outputIndex)
      .txInRedeemerValue("", "JSON")
      .txInScript(scripts.proposal.spend.cbor)
      .txInInlineDatumPresent()

      .mintPlutusScriptV3()
      .mint("-1", scripts.proposal.mint.hash, proposalAssetName)
      .mintingScript(scripts.proposal.mint.cbor)
      .mintRedeemerValue(approveSignOff, "JSON")

      .mintPlutusScriptV3()
      .mint("1", scripts.signOffApproval.mint.hash, proposalAssetName)
      .mintingScript(scripts.signOffApproval.mint.cbor)
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
  };

  SignOff = async (
    oracleUtxo: UTxO,
    signOffApprovalUtxo: UTxO,
    memberUtxo: UTxO,
    treasuryUtxos: UTxO[]
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

    const txBuilder = await this.newValidationTx(true);
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
      .txInRedeemerValue("", "JSON")
      .txInScript(scripts.proposal.spend.cbor)
      .txInInlineDatumPresent()

      .spendingPlutusScriptV3()
      .txIn(
        memberUtxo.input.txHash,
        memberUtxo.input.outputIndex,
        memberUtxo.output.amount,
        memberUtxo.output.address
      )
      .txInRedeemerValue(adminSignOffProject, "JSON")
      .txInScript(scripts.member.spend.cbor)
      .txInInlineDatumPresent()

      .mintPlutusScriptV3()
      .mint("-1", scripts.signOffApproval.mint.hash, signOffApprovalAssetName)
      .mintingScript(scripts.signOffApproval.mint.cbor)
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
      .withdrawalScript(scripts.treasury.withdraw.cbor)
      .withdrawalRedeemerValue("");

    for (const utxo of treasuryUtxos) {
      txBuilder
        .spendingPlutusScriptV3()
        .txIn(
          utxo.input.txHash,
          utxo.input.outputIndex,
          utxo.output.amount,
          utxo.output.address,
          0
        )
        .txInInlineDatumPresent()
        .txInScript(scripts.treasury.spend.cbor);
    }

    const txHex = await txBuilder.complete();

    return { txHex, treasuryUtxoTxIndex: 0, memberUtxoTxIndex: 1 };
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
