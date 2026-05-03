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

export const scripts = (setupUtxo: SetupUtxos, networkId: number) => {
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
      spend: new OracleSpendBlueprint(networkId),
    },
    counter: {
      mint: new CounterMintBlueprint([
        outputReference(
          setupUtxo.counter.txHash,
          setupUtxo.counter.outputIndex
        ),
      ]),
      spend: new CounterSpendBlueprint([oracleNFT], networkId),
    },
    membershipIntent: {
      mint: new MembershipIntentMintBlueprint([oracleNFT]),
      spend: new MembershipIntentSpendBlueprint([oracleNFT], networkId),
    },
    member: {
      mint: new MemberMintBlueprint([oracleNFT]),
      spend: new MemberSpendBlueprint([oracleNFT], networkId),
    },
    proposeIntent: {
      mint: new ProposeIntentMintBlueprint([oracleNFT]),
      spend: new ProposeIntentSpendBlueprint([oracleNFT], networkId),
    },
    proposal: {
      mint: new ProposalMintBlueprint([oracleNFT]),
      spend: new ProposalSpendBlueprint([oracleNFT], networkId),
    },
    signOffApproval: {
      mint: new SignOffApprovalMintBlueprint([oracleNFT]),
      spend: new SignOffApprovalSpendBlueprint([oracleNFT], networkId),
    },
    treasury: {
      spend: new TreasurySpendBlueprint([oracleNFT], networkId),
      withdraw: new TreasuryWithdrawBlueprint([oracleNFT], networkId),
    },
  };
};

export type UtxoRef = {
  txHash: string;
  outputIndex: number;
};

/**
 * Static, per-network deployment references baked into the SDK.
 * Update + republish when scripts are redeployed or when the oracle is moved.
 */
export type Deployment = {
  /** Live oracle UTxO. Update when admins rotate or threshold changes. */
  oracleUtxo: UtxoRef;
  /** Setup UTxOs whose outputs were consumed during initial mint of oracle/counter NFTs. Static. */
  setupUtxos: SetupUtxos;
  /** Reference-script UTxOs deployed during setup. Static unless scripts are redeployed. */
  refTxInScripts: RefTxInScripts;
};

export const MAINNET_DEPLOYMENT: Deployment = {
  oracleUtxo: {
    txHash:
      "9d164d0398947749f2e7d4ee051b787d140974e6b5326211ec0f502002a1239c",
    outputIndex: 0,
  },
  setupUtxos: {
    oracle: {
      txHash:
        "069835838eddbfb5b0b448a7db60adddbe0f3dd699ea47907ad40f8c1ea975a8",
      outputIndex: 0,
    },
    counter: {
      txHash:
        "266c182ee898324a47d1d3c7adad56dd0bedacbb6f34d247947efa93e8f1542a",
      outputIndex: 0,
    },
  },
  refTxInScripts: {
    membershipIntent: {
      mint: {
        txHash:
          "077fd3eb17be50c0afe4c143dc422d043948df48adc07fb4b3c8f86d46fe7d36",
        outputIndex: 0,
      },
      spend: {
        txHash:
          "077fd3eb17be50c0afe4c143dc422d043948df48adc07fb4b3c8f86d46fe7d36",
        outputIndex: 1,
      },
    },
    member: {
      mint: {
        txHash:
          "2f0823b02008825466230af8eb743cace7b6be301563947a75b20d4002e420fe",
        outputIndex: 0,
      },
      spend: {
        txHash:
          "2f0823b02008825466230af8eb743cace7b6be301563947a75b20d4002e420fe",
        outputIndex: 1,
      },
    },
    proposeIntent: {
      mint: {
        txHash:
          "d412e3e8f1eb84c97fd2f44efc9cb4976195be56be5d7a3aa8c93dbe2b18847f",
        outputIndex: 0,
      },
      spend: {
        txHash:
          "d412e3e8f1eb84c97fd2f44efc9cb4976195be56be5d7a3aa8c93dbe2b18847f",
        outputIndex: 1,
      },
    },
    proposal: {
      mint: {
        txHash:
          "15b915ec55940c71732eb595fc52f516c06145a3bcd9855ee0a2082bad8dc5e5",
        outputIndex: 0,
      },
      spend: {
        txHash:
          "15b915ec55940c71732eb595fc52f516c06145a3bcd9855ee0a2082bad8dc5e5",
        outputIndex: 1,
      },
    },
    signOffApproval: {
      mint: {
        txHash:
          "0b39ed8c3164c79ba83dcdc850a41b3f1acbceadcbeb4d217311f56a3c1dcea7",
        outputIndex: 0,
      },
      spend: {
        txHash:
          "0b39ed8c3164c79ba83dcdc850a41b3f1acbceadcbeb4d217311f56a3c1dcea7",
        outputIndex: 1,
      },
    },
    treasury: {
      spend: {
        txHash:
          "65ff24b265f429716bfb57850fadff3307ba2999e7f98a0de21ac71ff07abb21",
        outputIndex: 0,
      },
      withdrawal: {
        txHash:
          "65ff24b265f429716bfb57850fadff3307ba2999e7f98a0de21ac71ff07abb21",
        outputIndex: 1,
      },
    },
  },
};

export const PREPROD_DEPLOYMENT: Deployment = {
  oracleUtxo: {
    txHash:
      "d700e60ce6447f197659936e76ab72db8650192e64dfea5a3dff4af78e2ac330",
    outputIndex: 0,
  },
  setupUtxos: {
    oracle: {
      txHash:
        "301094d15e13f148a6cdbe02ca34fbb002684c3c6d29b3bdca466f2d591c2784",
      outputIndex: 1,
    },
    counter: {
      txHash:
        "301094d15e13f148a6cdbe02ca34fbb002684c3c6d29b3bdca466f2d591c2784",
      outputIndex: 0,
    },
  },
  refTxInScripts: {
    membershipIntent: {
      mint: {
        txHash:
          "0e21fea6425ff01db284a2b7f2887a799f0e5e1ccd6f71eb918bbebb197eb725",
        outputIndex: 0,
      },
      spend: {
        txHash:
          "0e21fea6425ff01db284a2b7f2887a799f0e5e1ccd6f71eb918bbebb197eb725",
        outputIndex: 1,
      },
    },
    member: {
      mint: {
        txHash:
          "3c1484c2b5e033a59cda76642ac1b6a8e7c03a27b0a62bd38ee4993eaef29cf3",
        outputIndex: 0,
      },
      spend: {
        txHash:
          "3c1484c2b5e033a59cda76642ac1b6a8e7c03a27b0a62bd38ee4993eaef29cf3",
        outputIndex: 1,
      },
    },
    proposeIntent: {
      mint: {
        txHash:
          "59261bf94d0b1f74b577c6c520dd4c141694d4622f25c3fa3bde8f5937e1005c",
        outputIndex: 0,
      },
      spend: {
        txHash:
          "59261bf94d0b1f74b577c6c520dd4c141694d4622f25c3fa3bde8f5937e1005c",
        outputIndex: 1,
      },
    },
    proposal: {
      mint: {
        txHash:
          "2c5423473afdad2aed8f21d6c6457b143baf4cb0f971bfab3578b2f6cf409b0c",
        outputIndex: 0,
      },
      spend: {
        txHash:
          "2c5423473afdad2aed8f21d6c6457b143baf4cb0f971bfab3578b2f6cf409b0c",
        outputIndex: 1,
      },
    },
    signOffApproval: {
      mint: {
        txHash:
          "8fa2cb8a84a3dc1ce7babafea86c0e129c290e104a32740e3ffe6982cf722787",
        outputIndex: 0,
      },
      spend: {
        txHash:
          "8fa2cb8a84a3dc1ce7babafea86c0e129c290e104a32740e3ffe6982cf722787",
        outputIndex: 1,
      },
    },
    treasury: {
      spend: {
        txHash:
          "c51999c95eedd992b420d7bbc131356ec6ba9046401db3537992690c5221a6c7",
        outputIndex: 0,
      },
      withdrawal: {
        txHash:
          "c51999c95eedd992b420d7bbc131356ec6ba9046401db3537992690c5221a6c7",
        outputIndex: 1,
      },
    },
  },
};

export const DEPLOYMENTS: Record<"mainnet" | "preprod", Deployment> = {
  mainnet: MAINNET_DEPLOYMENT,
  preprod: PREPROD_DEPLOYMENT,
};

export const getDeployment = (
  network: "mainnet" | "preprod"
): Deployment => DEPLOYMENTS[network];

export class CATConstants {
  network: "mainnet" | "preprod";

  networkId: number;

  /** Live oracle UTxO. Undefined when CATConstants is built during initial deployment. */
  oracleUtxo?: UtxoRef;

  scripts: any;

  refTxInScripts: RefTxInScripts;

  constructor(
    network: "mainnet" | "preprod",
    setupUtxo: SetupUtxos,
    refTxInScripts: RefTxInScripts,
    oracleUtxo?: UtxoRef
  ) {
    this.network = network;
    this.networkId = network === "mainnet" ? 1 : 0;
    this.scripts = scripts(setupUtxo, this.networkId);
    this.refTxInScripts = refTxInScripts;
    this.oracleUtxo = oracleUtxo;
  }

  /**
   * Build CATConstants from the SDK's baked-in deployment for the given network.
   * Use this in apps that target a stable, published deployment.
   */
  static fromNetwork(network: "mainnet" | "preprod"): CATConstants {
    const d = getDeployment(network);
    return new CATConstants(
      network,
      d.setupUtxos,
      d.refTxInScripts,
      d.oracleUtxo
    );
  }
}
