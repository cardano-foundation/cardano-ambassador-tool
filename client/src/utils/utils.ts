import { toast } from '@/components/toast/toast-manager';
import { BlockfrostService } from '@/services/blockfrostService';
import {
  BlockfrostProvider,
  ByteString,
  PubKeyAddress,
  ScriptAddress,
  UTxO,
  deserializeAddress,
  deserializeDatum,
  hexToString,
  plutusBSArrayToString,
  serializeAddressObj,
} from '@meshsdk/core';
import {
  Member,
  MemberData,
  MemberDatum,
  MembershipIntentDatum,
  MembershipMetadata,
  ProposalData,
  ProposalDatum,
  ProposalMetadata,
  scripts,
} from '@sidan-lab/cardano-ambassador-tool';
import { Utxo } from '@types';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function copyToClipboard(text: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast.success('Copied!', text);
    })
    .catch((err) => {
      toast.error('Failed to copy:', err);
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
export function getProvider(network = 'preprod'): BlockfrostProvider {
  const provider = new BlockfrostProvider(`/api/blockfrost/${network}/`);
  provider.setSubmitTxToBytes(false);
  return provider;
}

// ============================================================================
// Datum Parsing Utilities
// ============================================================================

/**
 * Helper function to safely extract readable string from ByteString | List<ByteString>
 */
const safeExtractString = (field: any, fieldName?: string): string => {
  try {
    // Check if it's a List<ByteString> (has a 'list' property)
    if (field?.list) {
      const hexResult = plutusBSArrayToString(field);
      // plutusBSArrayToString returns hex, so we need to decode it
      return hexToString(hexResult);
    }
    // Check if it's a single ByteString (has a 'bytes' property)
    if (field?.bytes) {
      return hexToString(field.bytes);
    }
    return '';
  } catch (error) {
    console.error(
      `Error extracting string from field ${fieldName || 'unknown'}:`,
      error,
    );
    return '';
  }
};

/**
 * Validates and converts Plutus data to MembershipIntentDatum
 * Only supports old 5-field structure - filters out new 15-field structure
 * @param plutusData The Plutus data to validate
 * @returns The parsed MembershipIntentDatum and MemberData for old structure, or null for new/invalid
 */
export function parseMembershipIntentDatum(
  plutusData: string,
): { datum: MembershipIntentDatum; metadata: MemberData } | null {
  try {
    const datum = deserializeDatum(plutusData);
    if (
      !datum ||
      !datum.fields ||
      !datum.fields[0]?.list ||
      !datum.fields[1]?.fields ||
      datum.fields[1].fields.length < 7
    ) {
      return null;
    }

    const metadataPlutus: MembershipMetadata = datum.fields[1];

    // //TODO update to v0.7
    try {
      serializeAddressObj(
        metadataPlutus.fields[0] as unknown as PubKeyAddress | ScriptAddress,
      );
    } catch {
      return null;
    }

    const metadata: MemberData = {
      walletAddress: serializeAddressObj(
        metadataPlutus.fields[0] as unknown as PubKeyAddress | ScriptAddress,
      ),
      fullName: safeExtractString(metadataPlutus.fields[1]),
      displayName: safeExtractString(metadataPlutus.fields[2]),
      emailAddress: safeExtractString(metadataPlutus.fields[3]),
      bio: safeExtractString(metadataPlutus.fields[4]),
      country: safeExtractString(metadataPlutus.fields[5]),
      city: safeExtractString(metadataPlutus.fields[6]),
    };

    return { datum: datum as MembershipIntentDatum, metadata };
  } catch (error) {
    console.error('Error parsing membership intent datum:', error);
    return null;
  }
}

export function parseMemberDatum(
  plutusData: string,
): { datum: MemberDatum; member: Member } | null {
  try {
    const datum = deserializeDatum(plutusData);
    if (
      !datum ||
      !datum.fields ||
      !datum.fields[0]?.list ||
      !datum.fields[1] ||
      typeof datum.fields[2]?.int === 'undefined' ||
      !datum.fields[3]?.fields
    ) {
      return null;
    }

    const metadataPlutus: MembershipMetadata = datum.fields[3];

    const metadata: MemberData = {
      walletAddress: serializeAddressObj(
        metadataPlutus.fields[0] as unknown as PubKeyAddress | ScriptAddress,
      ),
      fullName: safeExtractString(metadataPlutus.fields[1]),
      displayName: safeExtractString(metadataPlutus.fields[2]),
      emailAddress: safeExtractString(metadataPlutus.fields[3]),
      bio: safeExtractString(metadataPlutus.fields[4]),
      country: safeExtractString(metadataPlutus.fields[5]),
      city: safeExtractString(metadataPlutus.fields[6]),
    };

    const policyId = (datum.fields[0].list[0] as ByteString).bytes;
    const assetName = (datum.fields[0].list[1] as ByteString).bytes;

    const completion: Map<ProposalData, number> = new Map();
    datum.fields[1].map.forEach(
      (item: { k: { fields: { bytes: string }[] }; v: { int: number } }) => {
        completion.set(
          {
            projectDetails: hexToString(item.k.fields[0].bytes),
          },
          Number(item.v.int),
        );
      },
    );

    const fundReceived = Number(datum.fields[2].int);

    const member: Member = {
      token: { policyId, assetName },
      completion,
      fundReceived,
      metadata,
    };

    return { datum: datum as MemberDatum, member };
  } catch (error) {
    console.error('Error parsing member datum:', error);
    return null;
  }
}

/**
 * Validates and converts Plutus data to ProposalDatum
 * @param plutusData The Plutus data to validate
 * @returns The parsed ProposalDatum and ProposalData, or null if invalid
 */
export function parseProposalDatum(
  plutusData: string,
): { datum: ProposalDatum; metadata: ProposalData } | null {
  try {
    const datum = deserializeDatum(plutusData);
    if (
      !datum ||
      !datum.fields ||
      typeof datum.fields[0]?.int === 'undefined' ||
      !datum.fields[1] ||
      typeof datum.fields[2]?.int === 'undefined' ||
      !datum.fields[3]?.fields
    ) {
      return null;
    }
    const metadataPlutus: ProposalMetadata = datum.fields[3];
    const metadata: ProposalData = {
      projectDetails: hexToString(
        (metadataPlutus.fields[0] as ByteString).bytes,
      ),
    };
    return { datum: datum as ProposalDatum, metadata };
  } catch (error) {
    console.error('Error parsing proposal datum:', error);
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
  errorContext: string,
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
        }),
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
    'membership intent',
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
    'propose intent',
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
    'proposal',
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
    'sign off approval',
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
    'member',
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
  address: string,
): Promise<UTxO | null> {
  try {
    const utxos = await blockfrostService.fetchAddressUTxOs(
      SCRIPT_ADDRESSES.MEMBERSHIP_INTENT,
    );
    const utxosWithData = utxos.filter((utxo) => utxo.output.plutusData);
    const matchingUtxo = utxosWithData.find((utxo) => {
      try {
        if (!utxo.output.plutusData) return false;
        const datum: MembershipIntentDatum = deserializeDatum(
          utxo.output.plutusData,
        );
        const metadataPluts: MembershipMetadata = datum.fields[1];
        const walletAddress = serializeAddressObj(metadataPluts.fields[0]);
        return walletAddress === address;
      } catch (error) {
        console.error('Error processing UTxO:', error);
        return false;
      }
    });
    return matchingUtxo || null;
  } catch (error) {
    console.error('Error fetching or processing UTxOs:', error);
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
    const utxos =
      (await blockfrostService.fetchAddressUTxOs(
        SCRIPT_ADDRESSES.MEMBER_NFT,
      )) ?? [];
    const utxosWithData = utxos?.filter((utxo) => utxo.output.plutusData);
    const matchingUtxo = utxosWithData.find((utxo) => {
      try {
        if (!utxo.output.plutusData) return false;
        const datum: MemberDatum = deserializeDatum(utxo.output.plutusData);
        const metadataPlutus: MembershipMetadata = datum.fields[3];
        const walletAddress = serializeAddressObj(
          metadataPlutus.fields[0] as unknown as PubKeyAddress | ScriptAddress,
        );
        return walletAddress === address;
      } catch (error) {
        console.error('Error processing UTxO:', error);
        return false;
      }
    });
    return matchingUtxo || null;
  } catch (error) {
    console.error('Error fetching or processing UTxOs:', error);
    return null;
  }
}

/**
 * Finds a oracle UTxO
 * @param address The wallet address to search for
 * @returns The matching UTxO or null if not found
 */
export async function findOracleUtxo() {
  try {
    const utxo =
      (await blockfrostService.fetchUtxo(
        process.env.NEXT_PUBLIC_ORACLE_TX_HASH!,
      )) ?? [];

    if (!utxo.output.plutusData) {
      return null;
    }

    return utxo || null;
  } catch (error) {
    console.error('Error fetching or processing UTxOs:', error);
    return null;
  }
}

/**
 * Finds a member UTxO by asset name
 * @param assetName The asset name to search for
 * @returns The matching UTxO or null if not found
 */
export async function findMemberUtxoByAssetName(
  assetName: string,
): Promise<UTxO | null> {
  try {
    const utxos = await blockfrostService.fetchAddressUTxOs(
      SCRIPT_ADDRESSES.MEMBER_NFT,
    );
    const tokenUnit = POLICY_IDS.MEMBER_NFT + assetName;
    const utxosWithData = utxos.filter((utxo) => utxo.output.plutusData);
    const matchingUtxo = utxosWithData.find((utxo) =>
      utxo.output.amount.some((asset) => asset.unit === tokenUnit),
    );
    return matchingUtxo || null;
  } catch (error) {
    console.error('Error finding member UTxO by asset:', error);
    return null;
  }
}

/**
 * Finds a token UTxO associated with a member UTxO
 * @param memberUtxo The member UTxO to find the associated token for
 * @returns The matching token UTxO or null if not found
 */
export async function findTokenUtxoByMemberUtxo(
  memberUtxo: UTxO,
): Promise<UTxO | null> {
  try {
    if (!memberUtxo.output.plutusData) {
      console.error('Member UTxO does not contain Plutus data');
      return null;
    }
    const datum: MemberDatum = deserializeDatum(memberUtxo.output.plutusData);
    const metadataPlutus: MembershipMetadata = datum.fields[3];
    const walletAddress = serializeAddressObj(
      metadataPlutus.fields[0] as unknown as PubKeyAddress | ScriptAddress,
    );
    const policyId = datum.fields[0].list[0].bytes;
    const assetName = datum.fields[0].list[1].bytes;
    const tokenUnit = policyId + assetName;
    const utxos = await blockfrostService.fetchAddressUTxOs(walletAddress);
    const tokenUtxo = utxos.find((utxo: { output: { amount: any[] } }) => {
      return utxo.output.amount.some((asset) => asset.unit === tokenUnit);
    });
    if (!tokenUtxo) {
      return null;
    }
    return tokenUtxo;
  } catch (error) {
    console.error('Error finding token UTxO:', error);
    return null;
  }
}

/**
 * Finds a token UTxO associated with a membership intent UTxO
 * @param membershipIntentUtxo The membership intent UTxO to find the associated token for
 * @returns The matching token UTxO or null if not found
 */
export async function findTokenUtxoByMembershipIntentUtxo(
  membershipIntentUtxo: UTxO,
): Promise<UTxO | null> {
  try {
    if (!membershipIntentUtxo.output.plutusData) {
      throw 'Member UTxO does not contain Plutus data';
    }
    const datum: MembershipIntentDatum = deserializeDatum(
      membershipIntentUtxo.output.plutusData,
    );

    const metadataPluts: MembershipMetadata = datum.fields[1];
    const walletAddress = serializeAddressObj(metadataPluts.fields[0]);
    const policyId = datum.fields[0].list[0].bytes;
    const assetName = datum.fields[0].list[1].bytes;
    const tokenUnit = policyId + assetName;
    const utxos = await blockfrostService.fetchAddressUTxOs(walletAddress);
    const tokenUtxo = utxos.find((utxo) => {
      return utxo.output.amount.some((asset) => asset.unit === tokenUnit);
    });
    if (!tokenUtxo) {
      throw `No token UTxO found for token: ${tokenUnit}`;
    }
    return tokenUtxo;
  } catch (error) {
    throw error;
    return null;
  }
}

/**
 * Finds a token UTxO associated with a membership intent UTxO (blockchain version)
 * @param membershipIntentUtxo The membership intent UTxO to find the associated token for
 * @returns The matching token UTxO or null if not found
 */
export async function findTokenUtxoByMembershipIntentUtxoMesh(
  membershipIntentUtxo: UTxO,
): Promise<UTxO | null> {
  try {
    if (!membershipIntentUtxo.output.plutusData) {
      console.error('Member UTxO does not contain Plutus data');
      return null;
    }
    const datum: MembershipIntentDatum = deserializeDatum(
      membershipIntentUtxo.output.plutusData,
    );
    const metadataPlutus: MembershipMetadata = datum.fields[1];
    const walletAddress = serializeAddressObj(
      metadataPlutus.fields[0] as unknown as PubKeyAddress | ScriptAddress,
    );
    const policyId = datum.fields[0].list[0].bytes;
    const assetName = datum.fields[0].list[1].bytes;
    const tokenUnit = policyId + assetName;
    const utxos = await blockfrostService.fetchAddressUTxOs(walletAddress);
    const tokenUtxo = utxos.find((utxo: { output: { amount: any[] } }) => {
      return utxo.output.amount.some((asset) => asset.unit === tokenUnit);
    });
    if (!tokenUtxo) {
      return null;
    }
    return tokenUtxo;
  } catch (error) {
    console.error('Error finding token UTxO:', error);
    return null;
  }
}

export function findAdmins(): string[] | null {
  const adminList = Object.keys(process.env)
    .filter((key) => key.startsWith('ADMIN_WALLET'))
    .map((key) => deserializeAddress(process.env[key]!).pubKeyHash)
    .filter(Boolean);

  if (!adminList.length) {
    return null;
  }

  return adminList;
}

export function shortenString(text: string, length = 8) {
  if (!text) return '';
  return `${text.substring(0, length)}...${text.substring(text.length - length)}`;
}

// ============================================================================
// Type Conversion Utilities
// ============================================================================
/**
 * Converts database Utxo type to MeshJS UTxO type
 * @param dbUtxo The database Utxo to convert
 * @returns The converted MeshJS UTxO
 */
export function dbUtxoToMeshUtxo(dbUtxo: Utxo): UTxO {
  return {
    input: {
      txHash: dbUtxo.txHash,
      outputIndex: dbUtxo.outputIndex,
    },
    output: {
      address: dbUtxo.address,
      amount: JSON.parse(dbUtxo.amount || '[]'),
      dataHash: dbUtxo.dataHash || undefined,
      plutusData: dbUtxo.plutusData || undefined,
    },
  };
}

export function formatTimestamp(timestamp: Date) {
  return timestamp.toLocaleString('en-US', {
    month: 'long', // Full month name (June)
    day: 'numeric', // Day (29)
    year: 'numeric', // Year (2025)
    hour: 'numeric', // Hour (2)
    minute: '2-digit', // Minute (00)
    hour12: true, // AM/PM format
  });
}

export async function fetchTransactionTimestamp(txHash: string) {
  try {
    const blockfrost = getProvider();
    const txDetails = await blockfrost.fetchTxInfo(txHash);
    const blockDetails = await blockfrost.fetchBlockInfo(txDetails.block);

    if (blockDetails && blockDetails.time) {
      // block_time is Unix timestamp
      const timestamp = new Date(blockDetails.time * 1000);
      return timestamp;
    }

    return null;
  } catch (error) {
    throw new Error('Error fetching transaction timestamp:' + error);
  }
}
