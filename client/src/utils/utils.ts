import { toast } from '@/components/toast/toast-manager';
import { getCurrentNetworkConfig } from '@/config/cardano';
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
  pubKeyAddress,
  serializeAddressObj,
} from '@meshsdk/core';
import { deserializeTx } from '@meshsdk/core-csl';
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
import { ProposalItem, Utxo } from '@types';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getCatConstants } from './constants';

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

const catConstants = getCatConstants();

export const SCRIPT_ADDRESSES = {
  MEMBERSHIP_INTENT: catConstants.scripts.membershipIntent.spend.address,
  MEMBER_NFT: catConstants.scripts.member.spend.address,
  PROPOSE_INTENT: catConstants.scripts.proposeIntent.spend.address,
  PROPOSAL: catConstants.scripts.proposal.spend.address,
  SIGN_OFF_APPROVAL: catConstants.scripts.signOffApproval.spend.address,
} as const;

export const POLICY_IDS = {
  MEMBER_NFT: catConstants.scripts.member.mint.hash,
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
    if (field?.list) {
      const hexResult = plutusBSArrayToString(field);
      return hexToString(hexResult);
    }
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
      x_handle: safeExtractString(metadataPlutus.fields[7]),
      github: safeExtractString(metadataPlutus.fields[8]),
      discord: safeExtractString(metadataPlutus.fields[9]),
      spo_id: safeExtractString(metadataPlutus.fields[10]),
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
      x_handle: safeExtractString(metadataPlutus.fields[7]),
      github: safeExtractString(metadataPlutus.fields[8]),
      discord: safeExtractString(metadataPlutus.fields[9]),
      spo_id: safeExtractString(metadataPlutus.fields[10]),
    };

    const policyId = (datum.fields[0].list[0] as ByteString).bytes;
    const assetName = (datum.fields[0].list[1] as ByteString).bytes;

    const completion: Map<ProposalData, number> = new Map();

    datum.fields[1].map.forEach((item: ProposalItem) => {
      if (!item.k || !item.v) return null;
      console.log({ item });
      
      completion.set(
        {
          title: hexToString(item.k.fields[0].bytes || ''),
          url: hexToString(item.k.fields[1].bytes || ''),
          fundsRequested: hexToString(item.k.fields[2].bytes || ''),
          receiverWalletAddress: serializeAddressObj(item.k.fields[3]),
          submittedByAddress: serializeAddressObj(item.k.fields[4]),
          status: hexToString(item.k.fields[5].bytes || ''),
        },
        Number(item.v.int),
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
    console.error('Error parsing member datum:', error);
    return null;
  }
}

/**
 * Validates and converts Plutus data to ProposalDatum
 * @param plutusData The Plutus data to validate
 * @returns The parsed ProposalDatum and ProposalData, or null if invalid
 */
export function parseProposalDatum(plutusData: string): {
  datum: ProposalDatum;
  metadata: ProposalData;
  memberIndex: number;
} | null {
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

    const memberIndex = Number(datum.fields[2].int);
    const metadataPlutus: ProposalMetadata = datum.fields[3];

    const fundsRequestedLovelace = hexToString(
      (metadataPlutus.fields[2] as ByteString).bytes,
    );

    const metadata: ProposalData = {
      title: hexToString((metadataPlutus.fields[0] as ByteString).bytes),
      url: safeExtractString(metadataPlutus.fields[1] as ByteString),
      fundsRequested: lovelaceToAda(parseInt(fundsRequestedLovelace || '0')),
      receiverWalletAddress: serializeAddressObj(metadataPlutus.fields[3]),
      submittedByAddress: serializeAddressObj(metadataPlutus.fields[4]),
      status: hexToString((metadataPlutus.fields[5] as ByteString).bytes),
    };
    return { datum: datum as ProposalDatum, metadata, memberIndex };
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
    console.log({ utxos });
    
    const utxosWithData = utxos.filter((utxo) => utxo.output.plutusData);
    const matchingUtxo = utxosWithData.find((utxo) => {
        if (!utxo.output.plutusData) return false;
        const datum: MembershipIntentDatum = deserializeDatum(
          utxo.output.plutusData,
        );
        const metadataPluts: MembershipMetadata = datum.fields[1];
        const walletAddress = serializeAddressObj(metadataPluts.fields[0]);
        return walletAddress === address;
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
 * Finds a oracle UTxO (with caching)
 * This re-exports the cached version from roles.ts for convenience
 * @returns The matching UTxO or null if not found
 */
export { findOracleUtxo } from '@/lib/auth/roles';

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

export function extractWitnesses(txHex: string) {
  try {
    const tx = deserializeTx(txHex);
    const witnessSet = tx.witness_set();
    const vkeyWitnesses = witnessSet.vkeys();

    if (vkeyWitnesses) {
      const witnessKeys: string[] = [];

      for (let i = 0; i < vkeyWitnesses.len(); i++) {
        const witness = vkeyWitnesses.get(i);
        const vkey = witness.vkey();
        const pubKeyHash = vkey.public_key().hash().to_hex();
        witnessKeys.push(pubKeyHash);
      }

      return witnessKeys;
    }
  } catch (error) {
    throw new Error(String(error) || 'Failed to save counter UTxO');
  }
}

export function extractRequiredSigners(txHex: string) {
  try {
    const tx = deserializeTx(txHex);
    const txBody = tx.body();
    const requiredSigners = txBody.required_signers();

    if (requiredSigners) {
      const requiredSignerKeys: string[] = [];

      for (let i = 0; i < requiredSigners.len(); i++) {
        const pubKeyHash = requiredSigners.get(i).to_hex();
        requiredSignerKeys.push(pubKeyHash);
      }

      return requiredSignerKeys;
    }

    return [];
  } catch (error) {
    console.error('Failed to extract required signers:', error);
    return [];
  }
}

/**
 * Convert a public key hash to a Bech32 address
 * @param pubKeyHashHex The public key hash in hex format
 * @param networkId Network ID (0 for testnet, 1 for mainnet)
 * @returns The Bech32 address string
 */
export function pubKeyHashToAddress(
  pubKeyHashHex: string,
  networkId: number = getCurrentNetworkConfig().networkId,
): string {
  try {
    const pubKeyAddr = pubKeyAddress(pubKeyHashHex);
    const address = serializeAddressObj(pubKeyAddr, networkId);
    return address;
  } catch (error) {
    console.error('Failed to convert pubkey hash to address:', error);
    return pubKeyHashHex;
  }
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
  let amount;
  if (typeof dbUtxo.amount === 'string') {
    amount = JSON.parse(dbUtxo.amount || '[]');
  } else if (Array.isArray(dbUtxo.amount)) {
    amount = dbUtxo.amount;
  } else {
    amount = [];
  }

  return {
    input: {
      txHash: dbUtxo.txHash,
      outputIndex: dbUtxo.outputIndex,
    },
    output: {
      address: dbUtxo.address,
      amount: amount,
      dataHash: dbUtxo.dataHash || undefined,
      plutusData: dbUtxo.plutusData || undefined,
    },
  };
}

// ============================================================================
// Counter UTxO Utilities
// ============================================================================

/**
 * Retrieves the currently saved counter UTxO from storage via API.
 *
 * This function loads the persisted UTxO reference (transaction hash and output index)
 * from server-side storage and fetches the full UTxO details from Blockfrost.
 *
 * @returns The full MeshJS UTxO object if found, otherwise `null`.
 */
export async function getCounterUtxo(): Promise<UTxO | null> {
  try {
    const response = await fetch('/api/counter-utxo', {
      method: 'GET',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch counter UTxO');
    }

    const counterUtxo = await response.json();
    return counterUtxo;
  } catch (error) {
    console.error('Error fetching counter UTxO:', error);
    return null;
  }
}

/**
 * Safely saves a new counter UTxO reference to storage via API.
 *
 * @param txHash - The transaction hash of the UTxO.
 * @param outputIndex - The output index of the UTxO.
 * @returns `true` if saved successfully, otherwise throws an error.
 */
export async function saveCounterUtxo(
  txHash: string,
  outputIndex: number,
): Promise<boolean> {
  try {
    const response = await fetch('/api/counter-utxo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txHash, outputIndex }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save counter UTxO');
    }

    return true;
  } catch (error) {
    throw new Error(`Failed to save counter_utxo: ${String(error)}`);
  }
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
      const timestamp = new Date(blockDetails.time * 1000);
      return timestamp;
    }

    return null;
  } catch (error) {
    throw new Error('Error fetching transaction timestamp:' + error);
  }
}

// ============================================================================
// ADA/Lovelace Conversion Utilities
// ============================================================================

/**
 * Converts ADA to Lovelace (multiplies by 1,000,000)
 * @param ada The amount in ADA (can be string or number)
 * @returns The amount in Lovelace
 */
export function adaToLovelace(ada: string | number): number {
  const adaValue =
    typeof ada === 'string' ? parseFloat(ada.replace(/[^0-9.-]/g, '')) : ada;
  if (isNaN(adaValue)) {
    throw new Error('Invalid ADA value');
  }
  return Math.round(adaValue * 1_000_000);
}

/**
 * Converts Lovelace to ADA (divides by 1,000,000)
 * @param lovelace The amount in Lovelace
 * @returns The amount in ADA as a string with proper formatting
 */
export function lovelaceToAda(lovelace: number | string): string {
  const lovelaceValue =
    typeof lovelace === 'string' ? parseFloat(lovelace) : lovelace;
  if (isNaN(lovelaceValue)) {
    return '0';
  }
  const ada = lovelaceValue / 1_000_000;
  return ada.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
}

/**
 * Formats ADA amount for display with ₳ symbol
 * @param ada The amount in ADA (string or number)
 * @returns Formatted string with ₳ symbol
 */
export function formatAdaAmount(ada: string | number): string {
  const adaValue = typeof ada === 'string' ? ada : ada.toString();
  return `₳ ${adaValue}`;
}

/**
 * Parses user input that might contain 'ADA' text and extracts the numeric value
 * @param input User input string that might contain 'ADA'
 * @returns Clean numeric string or the original input if no 'ADA' found
 */
export function parseAdaInput(input: string): string {
  if (!input) return '';

  // Remove 'ADA', '₳', and extra whitespace, keep only numbers and decimal points
  const cleaned = input
    .replace(/ADA/gi, '')
    .replace(/₳/g, '')
    .replace(/[^0-9.-]/g, '')
    .trim();

  return cleaned || '';
}
