import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  BlockfrostProvider,
  UTxO,
  deserializeDatum,
  hexToString,
  serializeAddressObj,
} from "@meshsdk/core";
import {
  scripts,
  MembershipIntentDatum,
  MemberData,
  MembershipMetadata,
  MemberDatum,
  Member,
  ProposalData,
  ProposalDatum,
  ProposalMetadata,
  OracleDatum,
} from "@sidan-lab/cardano-ambassador-tool";
import { toast } from "@/components/toast/toast-manager";
import { BlockfrostService } from "@/services/blockfrostService";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
    .then(() => {
      toast.success("Copied!", text)
    })
    .catch(err => {
      toast.error("Failed to copy:", err)
    });
}


const blockfrostService = new BlockfrostService();

// Scripts and addresses
const allScripts = scripts({
  oracle: {
    txHash: process.env.NEXT_PUBLIC_ORACLE_SETUP_TX_HASH!,
    outputIndex: parseInt(process.env.NEXT_PUBLIC_ORACLE_SETUP_OUTPUT_INDEX!),
  },
  counter: {
    txHash: process.env.NEXT_PUBLIC_COUNTER_SETUP_TX_HASH!,
    outputIndex: parseInt(process.env.NEXT_PUBLIC_COUNTER_SETUP_OUTPUT_INDEX!),
  },
});

export const SCRIPT_ADDRESSES = {
  MEMBERSHIP_INTENT: allScripts.membershipIntent.spend.address,
  MEMBER_NFT: allScripts.member.spend.address,
  PROPOSE_INTENT: allScripts.proposeIntent.spend.address,
  PROPOSAL: allScripts.proposal.spend.address,
  SIGN_OFF_APPROVAL: allScripts.signOffApproval.spend.address,
} as const;

export const POLICY_IDS = {
  MEMBER_NFT: allScripts.member.mint.hash,
} as const;

// ============================================================================
// Provider Utility
// ============================================================================
/**
 * Creates and configures a Blockfrost provider
 * @param network The network to connect to (default: "preprod")
 * @returns Configured BlockfrostProvider instance
 */
export function getProvider(network = "preprod"): BlockfrostProvider {
  const provider = new BlockfrostProvider(`/api/blockfrost/${network}/`);
  provider.setSubmitTxToBytes(false);
  return provider;
}

// ============================================================================
// Datum Parsing Utilities
// ============================================================================
/**
 * Validates and converts Plutus data to MembershipIntentDatum
 * @param plutusData The Plutus data to validate
 * @returns The parsed MembershipIntentDatum and MemberData, or null if invalid
 */
export function parseMembershipIntentDatum(
  plutusData: string
): { datum: MembershipIntentDatum; metadata: MemberData } | null {
  try {
    const datum = deserializeDatum(plutusData);
    if (
      !datum ||
      !datum.fields ||
      !datum.fields[0]?.list ||
      !datum.fields[1].fields
    ) {
      return null;
    }
    const metadataPluts: MembershipMetadata = datum.fields[1];
    const metadata: MemberData = {
      walletAddress: serializeAddressObj(metadataPluts.fields[0]),
      fullName: hexToString(metadataPluts.fields[1].bytes),
      displayName: hexToString(metadataPluts.fields[2].bytes),
      emailAddress: hexToString(metadataPluts.fields[3].bytes),
      bio: hexToString(metadataPluts.fields[4].bytes),
    };
    return { datum: datum as MembershipIntentDatum, metadata };
  } catch (error) {
    console.error("Error parsing membership intent datum:", error);
    return null;
  }
}

export function parseMemberDatum(
  plutusData: string
): { datum: MemberDatum; member: Member } | null {
  try {
    const datum = deserializeDatum(plutusData);
    if (
      !datum ||
      !datum.fields ||
      !datum.fields[0]?.list ||
      !datum.fields[1] || // todo: check map
      typeof datum.fields[2]?.int === "undefined" ||
      !datum.fields[3]?.fields
    ) {
      return null;
    }
    const metadataPluts: MembershipMetadata = datum.fields[3];
    const metadata: MemberData = {
      walletAddress: serializeAddressObj(metadataPluts.fields[0]),
      fullName: hexToString(metadataPluts.fields[1].bytes),
      displayName: hexToString(metadataPluts.fields[2].bytes),
      emailAddress: hexToString(metadataPluts.fields[3].bytes),
      bio: hexToString(metadataPluts.fields[4].bytes),
    };

    const policyId = datum.fields[0].list[0].bytes;
    const assetName = datum.fields[0].list[1].bytes;

    const completion: Map<ProposalData, number> = new Map();
    datum.fields[1].map.forEach((item: { k: { fields: { bytes: string; }[]; }; v: { int: number; }; }) => {
      completion.set(
        {
          projectDetails: hexToString(item.k.fields[0].bytes),
        },
        Number(item.v.int)
      );
    });

    const fundReceived = Number(datum.fields[2].int);

    const member: Member = {
      token: { policyId, assetName },
      completion,
      fundReceived,
      metadata,
    };

    return { datum: datum as MemberDatum, member };
  } catch (error) {
    console.error("Error parsing member datum:", error);
    return null;
  }
}

/**
 * Validates and converts Plutus data to ProposalDatum
 * @param plutusData The Plutus data to validate
 * @returns The parsed ProposalDatum and ProposalData, or null if invalid
 */
export function parseProposalDatum(
  plutusData: string
): { datum: ProposalDatum; metadata: ProposalData } | null {
  try {
    const datum = deserializeDatum(plutusData);
    if (
      !datum ||
      !datum.fields ||
      typeof datum.fields[0]?.int === "undefined" ||
      !datum.fields[1] ||
      typeof datum.fields[2]?.int === "undefined" ||
      !datum.fields[3]?.fields
    ) {
      return null;
    }
    const metadataPluts: ProposalMetadata = datum.fields[3];
    const metadata: ProposalData = {
      projectDetails: hexToString(metadataPluts.fields[0].bytes),
    };
    return { datum: datum as ProposalDatum, metadata };
  } catch (error) {
    console.error("Error parsing proposal datum:", error);
    return null;
  }
}

// ============================================================================
// UTXO Fetching Utilities
// ============================================================================
/**
 * Generic function to fetch and validate UTxOs with Plutus data
 * @param address The address to fetch UTxOs from
 * @param parser Function to parse and validate the Plutus data
 * @param errorContext Context for error messages
 * @returns Array of valid UTxOs
 */
async function fetchAndValidateUtxos<T>(
  address: string,
  parser: (plutusData: string) => T | null,
  errorContext: string
): Promise<UTxO[]> {
  try {
    const utxos = await blockfrostService.fetchAddressUTxOs(address);
    const validUtxos = await Promise.all(
      utxos
        .filter((utxo) => utxo.output.plutusData)
        .map(async (utxo) => {
          try {
            const plutusData = utxo.output.plutusData;
            if (!plutusData) return null;
            const parsed = parser(plutusData);
            if (!parsed) return null;
            return utxo;
          } catch (error) {
            console.error(`Error parsing ${errorContext} UTxO:`, error);
            return null;
          }
        })
    );
    return validUtxos.filter((utxo): utxo is UTxO => utxo !== null);
  } catch (error) {
    console.error(`Error fetching ${errorContext} UTxOs:`, error);
    return [];
  }
}

/**
 * Fetches membership intent UTxOs
 * @returns Array of valid membership intent UTxOs
 */
export async function fetchMembershipIntentUtxos(): Promise<UTxO[]> {
  return fetchAndValidateUtxos(
    SCRIPT_ADDRESSES.MEMBERSHIP_INTENT,
    parseMembershipIntentDatum,
    "membership intent"
  );
}

/**
 * Fetches propose intent UTxOs
 * @returns Array of valid propose intent UTxOs
 */
export async function fetchProposeIntentUtxos(): Promise<UTxO[]> {
  return fetchAndValidateUtxos(
    SCRIPT_ADDRESSES.PROPOSE_INTENT,
    parseProposalDatum,
    "propose intent"
  );
}

/**
 * Fetches proposal UTxOs
 * @returns Array of valid proposal UTxOs
 */
export async function fetchProposalUtxos(): Promise<UTxO[]> {
  return fetchAndValidateUtxos(
    SCRIPT_ADDRESSES.PROPOSAL,
    parseProposalDatum,
    "proposal"
  );
}

/**
 * Fetches sign off approval UTxOs
 * @returns Array of valid sign off approval UTxOs
 */
export async function fetchSignOffApprovalUtxos(): Promise<UTxO[]> {
  return fetchAndValidateUtxos(
    SCRIPT_ADDRESSES.SIGN_OFF_APPROVAL,
    parseProposalDatum,
    "sign off approval"
  );
}

/**
 * Fetches member UTxOs
 * @returns Array of valid member UTxOs
 */
export async function fetchMemberUtxos(): Promise<UTxO[]> {
  return fetchAndValidateUtxos(
    SCRIPT_ADDRESSES.MEMBER_NFT,
    parseMemberDatum,
    "member"
  );
}

// ============================================================================
// Member/Token UTXO Utilities
// ============================================================================
/**
 * Finds a membership intent UTxO for a given address
 * @param address The wallet address to search for
 * @returns The matching UTxO or null if not found
 */
export async function findMembershipIntentUtxo(
  address: string
): Promise<UTxO | null> {
  try {
    const utxos = await blockfrostService.fetchAddressUTxOs(
      SCRIPT_ADDRESSES.MEMBERSHIP_INTENT
    );
    const utxosWithData = utxos.filter((utxo) => utxo.output.plutusData);
    const matchingUtxo = utxosWithData.find((utxo) => {
      try {
        if (!utxo.output.plutusData) return false;
        const datum: MembershipIntentDatum = deserializeDatum(
          utxo.output.plutusData
        );
        const metadataPluts: MembershipMetadata = datum.fields[1];
        const walletAddress = serializeAddressObj(metadataPluts.fields[0]);
        return walletAddress === address;
      } catch (error) {
        console.error("Error processing UTxO:", error);
        return false;
      }
    });
    return matchingUtxo || null;
  } catch (error) {
    console.error("Error fetching or processing UTxOs:", error);
    return null;
  }
}

/**
 * Finds a member UTxO that matches the given address
 * @param address The wallet address to search for
 * @returns The matching UTxO or null if not found
 */
export async function findMemberUtxo(address: string): Promise<UTxO | null> {
  try {
    const utxos = await blockfrostService.fetchAddressUTxOs(
      SCRIPT_ADDRESSES.MEMBER_NFT
    )??[];
    const utxosWithData = utxos?.filter((utxo) => utxo.output.plutusData);
    const matchingUtxo = utxosWithData.find((utxo) => {
      try {
        if (!utxo.output.plutusData) return false;
        const datum: MemberDatum = deserializeDatum(utxo.output.plutusData);
        const metadataPluts: MembershipMetadata = datum.fields[3];
        const walletAddress = serializeAddressObj(metadataPluts.fields[0]);
        return walletAddress === address;
      } catch (error) {
        console.error("Error processing UTxO:", error);
        return false;
      }
    });
    return matchingUtxo || null;
  } catch (error) {
    console.error("Error fetching or processing UTxOs:", error);
    return null;
  }
}

/**
 * Finds a member UTxO by asset name
 * @param assetName The asset name to search for
 * @returns The matching UTxO or null if not found
 */
export async function findMemberUtxoByAssetName(
  assetName: string
): Promise<UTxO | null> {
  try {
    const utxos = await blockfrostService.fetchAddressUTxOs(
      SCRIPT_ADDRESSES.MEMBER_NFT
    );
    const tokenUnit = POLICY_IDS.MEMBER_NFT + assetName;
    const utxosWithData = utxos.filter((utxo) => utxo.output.plutusData);
    const matchingUtxo = utxosWithData.find((utxo) =>
      utxo.output.amount.some((asset) => asset.unit === tokenUnit)
    );
    return matchingUtxo || null;
  } catch (error) {
    console.error("Error finding member UTxO by asset:", error);
    return null;
  }
}

/**
 * Finds a token UTxO associated with a member UTxO
 * @param memberUtxo The member UTxO to find the associated token for
 * @returns The matching token UTxO or null if not found
 */
export async function findTokenUtxoByMemberUtxo(
  memberUtxo: UTxO
): Promise<UTxO | null> {
  try {
    if (!memberUtxo.output.plutusData) {
      console.error("Member UTxO does not contain Plutus data");
      return null;
    }
    const datum: MemberDatum = deserializeDatum(memberUtxo.output.plutusData);
    const metadataPluts: MembershipMetadata = datum.fields[3];
    const walletAddress = serializeAddressObj(metadataPluts.fields[0]);
    const policyId = datum.fields[0].list[0].bytes;
    const assetName = datum.fields[0].list[1].bytes;
    const tokenUnit = policyId + assetName;
    const utxos = await blockfrostService.fetchAddressUTxOs(walletAddress);
    const tokenUtxo = utxos.find((utxo: { output: { amount: any[]; }; }) => {
      return utxo.output.amount.some((asset) => asset.unit === tokenUnit);
    });
    if (!tokenUtxo) {
      console.log(`No token UTxO found for token: ${tokenUnit}`);
      return null;
    }
    return tokenUtxo;
  } catch (error) {
    console.error("Error finding token UTxO:", error);
    return null;
  }
}

/**
 * Finds a token UTxO associated with a membership intent UTxO
 * @param membershipIntentUtxo The membership intent UTxO to find the associated token for
 * @returns The matching token UTxO or null if not found
 */
export async function findTokenUtxoByMembershipIntentUtxo(
  membershipIntentUtxo: UTxO
): Promise<UTxO | null> {
  try {
    if (!membershipIntentUtxo.output.plutusData) {
      console.error("Member UTxO does not contain Plutus data");
      return null;
    }
    const datum: MembershipIntentDatum = deserializeDatum(
      membershipIntentUtxo.output.plutusData
    );
    const metadataPluts: MembershipMetadata = datum.fields[1];
    const walletAddress = serializeAddressObj(metadataPluts.fields[0]);
    const policyId = datum.fields[0].list[0].bytes;
    const assetName = datum.fields[0].list[1].bytes;
    const tokenUnit = policyId + assetName;
    const utxos = await blockfrostService.fetchAddressUTxOs(walletAddress);
    const tokenUtxo = utxos.find((utxo: { output: { amount: any[]; }; }) => {
      return utxo.output.amount.some((asset) => asset.unit === tokenUnit);
    });
    if (!tokenUtxo) {
      console.log(`No token UTxO found for token: ${tokenUnit}`);
      return null;
    }
    return tokenUtxo;
  } catch (error) {
    console.error("Error finding token UTxO:", error);
    return null;
  }
}

/**
 * Finds a token UTxO associated with a membership intent UTxO
 * @param membershipIntentUtxo The membership intent UTxO to find the associated token for
 * @returns array of admins pubkHash or null
 */
export async function findAdmins(): Promise<string[] | null> {

  const blockfrost = getProvider();

  const utxos = (await blockfrost.fetchUTxOs(
    process.env.NEXT_PUBLIC_ORACLE_TX_HASH!, parseInt(process.env.NEXT_PUBLIC_ORACLE_OUTPOUT_INDEX!)
  ))[0];

  if (!utxos.output.plutusData) {
    console.error("Member UTxO does not contain Plutus data");
    return null;
  }
  const datum: OracleDatum = deserializeDatum(
    utxos.output.plutusData
  );
  const adminList = datum.fields[0].list.map((item: any) => {
    if (item.bytes) {
      return item.bytes;
    }
    if (item.fields) {
      return item.fields.map((f: any) => f.bytes || f);
    }
    return item;
  });

  if (!adminList.length) {
    return null;

  }

  return adminList

}




export function shortenString(text: string,length = 8) {
  if (!text) return '';
  return `${text.substring(0, length)}...${text.substring(text.length - length)}`;
};








