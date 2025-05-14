import { IWallet, UTxO } from "@meshsdk/core";
import { Layer1Tx } from "../lib/common";
import {
  admin_key_first,
  admin_key_second,
  minUtxos,
  scripts,
} from "../lib/constant";

import {
  addMember,
  approveMember,
  CounterDatum,
  counterDatum,
  incrementCount,
  memberDatum,
  MemberDatum,
  rejectMember,
} from "@/lib";

export class AdminActionTx extends Layer1Tx {
  constructor(address: string, userWallet: IWallet) {
    super(userWallet, address);
  }

  /**
   * External tx called by user
   * @param utxos
   * @param toDeposit
   * @returns
   */
  approveMember = async (
    oracleUtxo: UTxO,
    counterUtxo: UTxO,
    membershipIntentUtxo: UTxO,
    count: number,
    tokenPolicyId: string,
    tokenAssetName: string
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
      .mint("1", scripts.member.mint.hash, "count todo")
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
          unit: scripts.member.mint.hash + "count todo",
          quantity: "1",
        },
      ])
      .txOutInlineDatumValue(new_member_datum, "JSON")

      .requiredSignerHash(admin_key_first)
      .requiredSignerHash(admin_key_second);

    const txHex = await txBuilder.complete();

    return { txHex, counterUtxoTxIndex: 0, memberUtxoTxIndex: 1 };
  };

  rejectMember = async (oracleUtxo: UTxO, membershipIntentUtxo: UTxO) => {
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
      .mintRedeemerValue(rejectMember)

      .requiredSignerHash(admin_key_first)
      .requiredSignerHash(admin_key_second);

    const txHex = await txBuilder.complete();

    return { txHex, txIndex: 0 };
  };
}
