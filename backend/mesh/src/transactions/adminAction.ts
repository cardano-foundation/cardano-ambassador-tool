import { IWallet, UTxO } from "@meshsdk/core";
import { Layer1Tx } from "../lib/common";
import { minUtxos, scripts } from "../lib/constant";

import {
  addMember,
  adminRemoveMember,
  approveMember,
  approveProposal,
  approveSignOff,
  CounterDatum,
  counterDatum,
  incrementCount,
  memberDatum,
  MemberDatum,
  mintProposal,
  mintSignOffApproval,
  oracleDatum,
  OracleDatum,
  processSignOff,
  rejectMember,
  rejectProposal,
  removeMember,
  RotateAdmin,
  rotateAdmin,
  stopCounter,
  stopOracle,
  UpdateThreshold,
  updateThreshold,
} from "@/lib";

export class AdminActionTx extends Layer1Tx {
  constructor(address: string, userWallet: IWallet) {
    super(userWallet, address);
  }

  // todo: handle multisig
  approveMember = async (
    oracleUtxo: UTxO,
    counterUtxo: UTxO,
    membershipIntentUtxo: UTxO,
    count: number,
    tokenPolicyId: string,
    tokenAssetName: string,
    admin_signed: string[]
  ) => {
    const new_member_datum: MemberDatum = memberDatum(
      tokenPolicyId,
      tokenAssetName,
      new Map(),
      0
    );
    const updated_counter_datum: CounterDatum = counterDatum(count + 1);

    const txBuilder = await this.newValidationTx(true);
    txBuilder
      .readOnlyTxInReference(
        oracleUtxo.input.txHash,
        oracleUtxo.input.outputIndex
      )

      .spendingPlutusScriptV3()
      .txIn(counterUtxo.input.txHash, counterUtxo.input.outputIndex)
      .txInRedeemerValue(incrementCount, "JSON")
      .txInScript(scripts.counter.spend.cbor)
      .txInInlineDatumPresent()

      .spendingPlutusScriptV3()
      .txIn(
        membershipIntentUtxo.input.txHash,
        membershipIntentUtxo.input.outputIndex
      )
      .txInRedeemerValue("", "JSON")
      .txInScript(scripts.membershipIntent.spend.cbor)
      .txInInlineDatumPresent()

      .mintPlutusScriptV3()
      .mint("1", scripts.member.mint.hash, count.toString())
      .mintingScript(scripts.member.mint.cbor)
      .mintRedeemerValue(addMember)

      .mintPlutusScriptV3()
      .mint("-1", scripts.membershipIntent.mint.hash, "")
      .mintingScript(scripts.membershipIntent.mint.cbor)
      .mintRedeemerValue(approveMember)

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
          unit: scripts.member.mint.hash + count.toString(),
          quantity: "1",
        },
      ])
      .txOutInlineDatumValue(new_member_datum, "JSON");

    for (const admin of admin_signed) {
      txBuilder.requiredSignerHash(admin);
    }
    const txHex = await txBuilder.complete();

    return { txHex, counterUtxoTxIndex: 0, memberUtxoTxIndex: 1 };
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
        membershipIntentUtxo.input.outputIndex
      )
      .txInRedeemerValue("", "JSON")
      .txInScript(scripts.membershipIntent.spend.cbor)
      .txInInlineDatumPresent()

      .mintPlutusScriptV3()
      .mint("-1", scripts.membershipIntent.mint.hash, "")
      .mintingScript(scripts.membershipIntent.mint.cbor)
      .mintRedeemerValue(rejectMember);

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
    memberAssetName: string,
    admin_signed: string[]
  ) => {
    const txBuilder = await this.newValidationTx(true);
    txBuilder
      .readOnlyTxInReference(
        oracleUtxo.input.txHash,
        oracleUtxo.input.outputIndex
      )

      .spendingPlutusScriptV3()
      .txIn(memberUtxo.input.txHash, memberUtxo.input.outputIndex)
      .txInRedeemerValue(adminRemoveMember, "JSON")
      .txInScript(scripts.member.spend.cbor)
      .txInInlineDatumPresent()

      .mintPlutusScriptV3()
      .mint("-1", scripts.member.mint.hash, memberAssetName)
      .mintingScript(scripts.member.mint.cbor)
      .mintRedeemerValue(removeMember);

    for (const admin of admin_signed) {
      txBuilder.requiredSignerHash(admin);
    }

    const txHex = await txBuilder.complete();

    return { txHex };
  };

  // todo: handle multisig
  // todo: mint same assetname
  approveProposal = async (
    oracleUtxo: UTxO,
    prposeIntentUtxo: UTxO,
    admin_signed: string[]
  ) => {
    const txBuilder = await this.newValidationTx(true);
    txBuilder
      .readOnlyTxInReference(
        oracleUtxo.input.txHash,
        oracleUtxo.input.outputIndex
      )

      .spendingPlutusScriptV3()
      .txIn(prposeIntentUtxo.input.txHash, prposeIntentUtxo.input.outputIndex)
      .txInRedeemerValue("", "JSON")
      .txInScript(scripts.proposeIntent.spend.cbor)
      .txInInlineDatumPresent()

      .mintPlutusScriptV3()
      .mint("-1", scripts.proposeIntent.mint.hash, "todo")
      .mintingScript(scripts.proposeIntent.mint.cbor)
      .mintRedeemerValue(approveProposal)

      .mintPlutusScriptV3()
      .mint("1", scripts.proposal.mint.hash, "todo")
      .mintingScript(scripts.proposal.mint.cbor)
      .mintRedeemerValue(mintProposal)

      .txOut(scripts.proposal.spend.address, [
        { unit: "lovelace", quantity: minUtxos.proposal },
        {
          unit: scripts.proposal.mint.hash + "todo",
          quantity: "1",
        },
      ])
      .txOutInlineDatumValue("todo", "JSON");

    for (const admin of admin_signed) {
      txBuilder.requiredSignerHash(admin);
    }

    const txHex = await txBuilder.complete();

    return { txHex, txIndex: 0 };
  };

  // todo: handle multisig
  rejectProposal = async (
    oracleUtxo: UTxO,
    prposeIntentUtxo: UTxO,
    admin_signed: string[]
  ) => {
    const txBuilder = await this.newValidationTx(true);
    txBuilder
      .readOnlyTxInReference(
        oracleUtxo.input.txHash,
        oracleUtxo.input.outputIndex
      )

      .spendingPlutusScriptV3()
      .txIn(prposeIntentUtxo.input.txHash, prposeIntentUtxo.input.outputIndex)
      .txInRedeemerValue("", "JSON")
      .txInScript(scripts.proposeIntent.spend.cbor)
      .txInInlineDatumPresent()

      .mintPlutusScriptV3()
      .mint("-1", scripts.proposeIntent.mint.hash, "todo")
      .mintingScript(scripts.proposeIntent.mint.cbor)
      .mintRedeemerValue(rejectProposal);

    for (const admin of admin_signed) {
      txBuilder.requiredSignerHash(admin);
    }

    const txHex = await txBuilder.complete();

    return { txHex };
  };

  // todo: handle multisig
  // todo: mint same assetname
  approveSignOff = async (
    oracleUtxo: UTxO,
    proposalUtxo: UTxO,
    admin_signed: string[]
  ) => {
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
      .mint("-1", scripts.proposal.mint.hash, "todo")
      .mintingScript(scripts.proposal.mint.cbor)
      .mintRedeemerValue(approveSignOff)

      .mintPlutusScriptV3()
      .mint("1", scripts.signOffApproval.mint.hash, "todo")
      .mintingScript(scripts.signOffApproval.mint.cbor)
      .mintRedeemerValue(mintSignOffApproval)

      .txOut(scripts.signOffApproval.spend.address, [
        { unit: "lovelace", quantity: minUtxos.signOffApproval },
        {
          unit: scripts.signOffApproval.mint.hash + "todo",
          quantity: "1",
        },
      ])
      .txOutInlineDatumValue("todo", "JSON");

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
    const updated_member_datum: MemberDatum = memberDatum(
      "todo",
      "todo",
      new Map(),
      0
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
        signOffApprovalUtxo.input.outputIndex
      )
      .txInRedeemerValue("", "JSON")
      .txInScript(scripts.proposal.spend.cbor)
      .txInInlineDatumPresent()

      .spendingPlutusScriptV3()
      .txIn(memberUtxo.input.txHash, memberUtxo.input.outputIndex)
      .txInRedeemerValue(adminRemoveMember, "JSON")
      .txInScript(scripts.member.spend.cbor)
      .txInInlineDatumPresent()

      .mintPlutusScriptV3()
      .mint("-1", scripts.signOffApproval.mint.hash, "todo")
      .mintingScript(scripts.signOffApproval.mint.cbor)
      .mintRedeemerValue(processSignOff)

      .txOut(scripts.signOffApproval.spend.address, [
        { unit: "lovelace", quantity: minUtxos.signOffApproval },
        {
          unit: scripts.signOffApproval.mint.hash + "todo",
          quantity: "1",
        },
      ])
      .txOutInlineDatumValue("todo", "JSON")

      .txOut(scripts.member.spend.address, [
        { unit: "lovelace", quantity: minUtxos.member },
        {
          unit: scripts.member.mint.hash + "todo",
          quantity: "1",
        },
      ])
      .txOutInlineDatumValue(updated_member_datum, "JSON");

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

  // todo: handle multisig and update oracle
  rotateAdmin = async (
    oracleUtxo: UTxO,
    admin_signed: string[],
    new_admins: string[],
    new_admin_tenure: string
  ) => {
    const redeemer: RotateAdmin = rotateAdmin(new_admins, new_admin_tenure);

    const updated_oracle_datum: OracleDatum = oracleDatum;

    const txBuilder = await this.newValidationTx(true);
    txBuilder
      .spendingPlutusScriptV3()
      .txIn(oracleUtxo.input.txHash, oracleUtxo.input.outputIndex)
      .txInRedeemerValue(redeemer, "JSON")
      .txInScript(scripts.oracle.spend.cbor)
      .txInInlineDatumPresent()

      .txOut(scripts.oracle.spend.address, [
        { unit: "lovelace", quantity: minUtxos.member },
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

  // todo: handle multisig and update oracle
  updateThreshold = async (
    oracleUtxo: UTxO,
    admin_signed: string[],
    new_threshold: number
  ) => {
    const redeemer: UpdateThreshold = updateThreshold(new_threshold);

    const updated_oracle_datum: OracleDatum = oracleDatum;

    const txBuilder = await this.newValidationTx(true);
    txBuilder
      .spendingPlutusScriptV3()
      .txIn(oracleUtxo.input.txHash, oracleUtxo.input.outputIndex)
      .txInRedeemerValue(redeemer, "JSON")
      .txInScript(scripts.oracle.spend.cbor)
      .txInInlineDatumPresent()

      .txOut(scripts.oracle.spend.address, [
        { unit: "lovelace", quantity: minUtxos.member },
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

  // todo: handle multisig and update oracle
  stopOracle = async (oracleUtxo: UTxO, admin_signed: string[]) => {
    const updated_oracle_datum: OracleDatum = oracleDatum;

    const txBuilder = await this.newValidationTx(true);
    txBuilder
      .spendingPlutusScriptV3()
      .txIn(oracleUtxo.input.txHash, oracleUtxo.input.outputIndex)
      .txInRedeemerValue(stopOracle, "JSON")
      .txInScript(scripts.oracle.spend.cbor)
      .txInInlineDatumPresent()

      .txOut(scripts.oracle.spend.address, [
        { unit: "lovelace", quantity: minUtxos.member },
        {
          unit: scripts.oracle.mint.hash,
          quantity: "1",
        },
      ])
      .txOutInlineDatumValue(updated_oracle_datum, "JSON")

      .mintPlutusScriptV3()
      .mint("-1", scripts.oracle.mint.hash, "")
      .mintingScript(scripts.oracle.mint.cbor)
      .mintRedeemerValue("");

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
      .txIn(counterUtxo.input.txHash, counterUtxo.input.outputIndex)
      .txInRedeemerValue(stopCounter, "JSON")
      .txInScript(scripts.counter.spend.cbor)
      .txInInlineDatumPresent()

      .mintPlutusScriptV3()
      .mint("-1", scripts.counter.mint.hash, "")
      .mintingScript(scripts.counter.mint.cbor)
      .mintRedeemerValue("");

    for (const admin of admin_signed) {
      txBuilder.requiredSignerHash(admin);
    }

    const txHex = await txBuilder.complete();

    return { txHex };
  };
}
