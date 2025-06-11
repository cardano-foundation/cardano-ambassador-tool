import { byteString, outputReference, resolveScriptHash } from "@meshsdk/core";
import {
  CounterMintBlueprint,
  CounterSpendBlueprint,
  MemberMintBlueprint,
  MembershipIntentMintBlueprint,
  MembershipIntentSpendBlueprint,
  MemberSpendBlueprint,
  OracleMintBlueprint,
  OracleSpendBlueprint,
  ProposalMintBlueprint,
  ProposalSpendBlueprint,
  ProposeIntentMintBlueprint,
  ProposeIntentSpendBlueprint,
  SignOffApprovalMintBlueprint,
  SignOffApprovalSpendBlueprint,
  TreasurySpendBlueprint,
  TreasuryWithdrawBlueprint,
} from "./bar";
import { SetupUtxos, RefTxInScripts } from "./types";

export const policyIdLength = 56; // Assuming the policyId is always 56 characters

export const scripts = (setupUtxo: SetupUtxos) => {
  const oracleNFT = byteString(
    resolveScriptHash(
      new OracleMintBlueprint([
        outputReference(setupUtxo.oracle.txHash, setupUtxo.oracle.outputIndex),
      ]).cbor,
      "V3"
    )
  );

  return {
    oracle: {
      mint: new OracleMintBlueprint([
        outputReference(setupUtxo.oracle.txHash, setupUtxo.oracle.outputIndex),
      ]),
      spend: new OracleSpendBlueprint(),
    },
    counter: {
      mint: new CounterMintBlueprint([
        outputReference(
          setupUtxo.counter.txHash,
          setupUtxo.counter.outputIndex
        ),
      ]),
      spend: new CounterSpendBlueprint([oracleNFT]),
    },
    membershipIntent: {
      mint: new MembershipIntentMintBlueprint([oracleNFT]),
      spend: new MembershipIntentSpendBlueprint([oracleNFT]),
    },
    member: {
      mint: new MemberMintBlueprint([oracleNFT]),
      spend: new MemberSpendBlueprint([oracleNFT]),
    },
    proposeIntent: {
      mint: new ProposeIntentMintBlueprint([oracleNFT]),
      spend: new ProposeIntentSpendBlueprint([oracleNFT]),
    },
    proposal: {
      mint: new ProposalMintBlueprint([oracleNFT]),
      spend: new ProposalSpendBlueprint([oracleNFT]),
    },
    signOffApproval: {
      mint: new SignOffApprovalMintBlueprint([oracleNFT]),
      spend: new SignOffApprovalSpendBlueprint([oracleNFT]),
    },
    treasury: {
      spend: new TreasurySpendBlueprint([oracleNFT]),
      withdraw: new TreasuryWithdrawBlueprint([oracleNFT]),
    },
  };
};

export class CATConstants {
  network: "mainnet" | "preprod";

  networkId: number;

  scripts: any;

  refTxInScripts: RefTxInScripts;

  constructor(
    network: "mainnet" | "preprod",
    setupUtxo: SetupUtxos,
    refTxInScripts: RefTxInScripts
  ) {
    this.network = network;
    this.networkId = network === "mainnet" ? 1 : 0;
    this.scripts = scripts(setupUtxo);
    this.refTxInScripts = refTxInScripts;
  }
}
