import {
  MembershipIntentDatum,
  MemberData,
  MembershipMetadata,
  MemberDatum,
  ProposalDatum,
  ProposalData,
  ProposalMetadata,
  scripts,
} from "@/lib";
import { BlockfrostService } from "@/services";
import {
  BlockfrostProvider,
  UTxO,
  deserializeDatum,
  hexToString,
  serializeAddressObj,
} from "@meshsdk/core";

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const blockfrostService = new BlockfrostService();

// Initialize scripts configuration
const allScripts = scripts({
  oracle: {
    txHash:
      process.env.NEXT_PUBLIC_ORACLE_SETUP_TX_HASH ||
      "1f2344f32e3ea769e58394719f3eea9a6170796de75884b80aa8df410a965b08",
    outputIndex: parseInt(
      process.env.NEXT_PUBLIC_ORACLE_SETUP_OUTPUT_INDEX || "1"
    ),
  },
  counter: {
    txHash:
      process.env.NEXT_PUBLIC_COUNTER_SETUP_TX_HASH ||
      "e32a7c0204a2f624934b5fe32b850076787fc9a2d66e91756ff192c6efc774ac",
    outputIndex: parseInt(
      process.env.NEXT_PUBLIC_COUNTER_SETUP_OUTPUT_INDEX || "1"
    ),
  },
});

// Script addresses
export const SCRIPT_ADDRESSES = {
  MEMBERSHIP_INTENT: allScripts.membershipIntent.spend.address,
  MEMBER_NFT: allScripts.member.spend.address,
  PROPOSE_INTENT: allScripts.proposeIntent.spend.address,
  PROPOSAL: allScripts.proposal.spend.address,
  SIGN_OFF_APPROVAL: allScripts.signOffApproval.spend.address,
} as const;

// Policy IDs
export const POLICY_IDS = {
  MEMBER_NFT: allScripts.member.mint.hash,
} as const;

// ============================================================================
// PROVIDER UTILITIES
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
// DATUM PARSING UTILITIES
// ============================================================================

/**
 * Validates and converts Plutus data to MembershipIntentDatum
 * @param plutusData The Plutus data to validate
 * @returns The parsed MembershipIntentDatum and MemberData, or null if invalid
 */
export const parseMembershipIntentDatum = (
  plutusData: string
): { datum: MembershipIntentDatum; metadata: MemberData } | null => {
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

    // Extract and validate metadata
    const metadataPluts: MembershipMetadata = datum.fields[1];

    const metadata: MemberData = {
      walletAddress: serializeAddressObj(metadataPluts.fields[0]),
      fullName: hexToString(metadataPluts.fields[1].bytes),
      displayName: hexToString(metadataPluts.fields[2].bytes),
      emailAddress: hexToString(metadataPluts.fields[3].bytes),
      bio: hexToString(metadataPluts.fields[4].bytes),
    };

    return {
      datum: datum as MembershipIntentDatum,
      metadata,
    };
  } catch (error) {
    console.error("Error parsing membership intent datum:", error);
    return null;
  }
};

/**
 * Validates and converts Plutus data to ProposalDatum
 * @param plutusData The Plutus data to validate
 * @returns The parsed ProposalDatum and ProposalData, or null if invalid
 */
export const parseProposalDatum = (
  plutusData: string
): { datum: ProposalDatum; metadata: ProposalData } | null => {
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

    // Extract and validate metadata
    const metadataPluts: ProposalMetadata = datum.fields[3];
    const metadata: ProposalData = {
      projectDetails: hexToString(metadataPluts.fields[0].bytes),
    };

    return {
      datum: datum as ProposalDatum,
      metadata,
    };
  } catch (error) {
    console.error("Error parsing proposal datum:", error);
    return null;
  }
};

// ============================================================================
// UTXO FETCHING UTILITIES
// ============================================================================

/**
 * Generic function to fetch and validate UTxOs with Plutus data
 * @param address The address to fetch UTxOs from
 * @param parser Function to parse and validate the Plutus data
 * @param errorContext Context for error messages
 * @returns Array of valid UTxOs
 */
const fetchAndValidateUtxos = async <T>(
  address: string,
  parser: (plutusData: string) => T | null,
  errorContext: string
): Promise<UTxO[]> => {
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
};

/**
 * Fetches membership intent UTxOs
 * @returns Array of valid membership intent UTxOs
 */
export const fetchMembershipIntentUtxos = async (): Promise<UTxO[]> => {
  return fetchAndValidateUtxos(
    SCRIPT_ADDRESSES.MEMBERSHIP_INTENT,
    parseMembershipIntentDatum,
    "membership intent"
  );
};

/**
 * Fetches propose intent UTxOs
 * @returns Array of valid propose intent UTxOs
 */
export const fetchProposeIntentUtxos = async (): Promise<UTxO[]> => {
  return fetchAndValidateUtxos(
    SCRIPT_ADDRESSES.PROPOSE_INTENT,
    parseProposalDatum,
    "propose intent"
  );
};

/**
 * Fetches proposal UTxOs
 * @returns Array of valid proposal UTxOs
 */
export const fetchProposalUtxos = async (): Promise<UTxO[]> => {
  return fetchAndValidateUtxos(
    SCRIPT_ADDRESSES.PROPOSAL,
    parseProposalDatum,
    "proposal"
  );
};

/**
 * Fetches sign off approval UTxOs
 * @returns Array of valid sign off approval UTxOs
 */
export const fetchSignOffApprovalUtxos = async (): Promise<UTxO[]> => {
  return fetchAndValidateUtxos(
    SCRIPT_ADDRESSES.SIGN_OFF_APPROVAL,
    parseProposalDatum,
    "sign off approval"
  );
};

// ============================================================================
// MEMBER UTXO UTILITIES
// ============================================================================

/**
 * Finds a member UTxO that matches the given address
 * @param address The wallet address to search for
 * @returns The matching UTxO or null if not found
 */
export const findMemberUtxo = async (address: string): Promise<UTxO | null> => {
  try {
    const utxos = await blockfrostService.fetchAddressUTxOs(
      SCRIPT_ADDRESSES.MEMBER_NFT
    );

    // Filter out UTxOs without Plutus data
    const utxosWithData = utxos.filter((utxo) => utxo.output.plutusData);

    // Find the first UTxO that matches the address
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
};

/**
 * Finds a member UTxO by asset name
 * @param assetName The asset name to search for
 * @returns The matching UTxO or null if not found
 */
export const findMemberUtxoByAssetName = async (
  assetName: string
): Promise<UTxO | null> => {
  try {
    const utxos = await blockfrostService.fetchAddressUTxOs(
      SCRIPT_ADDRESSES.MEMBER_NFT
    );
    const tokenUnit = POLICY_IDS.MEMBER_NFT + assetName;

    // Find the first UTxO that contains the asset
    const matchingUtxo = utxos.find((utxo) =>
      utxo.output.amount.some((asset) => asset.unit === tokenUnit)
    );

    return matchingUtxo || null;
  } catch (error) {
    console.error("Error finding member UTxO by asset:", error);
    return null;
  }
};

// ============================================================================
// TOKEN UTXO UTILITIES
// ============================================================================

/**
 * Finds a token UTxO associated with a member UTxO
 * @param memberUtxo The member UTxO to find the associated token for
 * @returns The matching token UTxO or null if not found
 */
export const findTokenUtxo = async (memberUtxo: UTxO): Promise<UTxO | null> => {
  try {
    // Validate member UTxO has Plutus data
    if (!memberUtxo.output.plutusData) {
      console.error("Member UTxO does not contain Plutus data");
      return null;
    }

    // Extract member data from Plutus datum
    const datum: MemberDatum = deserializeDatum(memberUtxo.output.plutusData);
    const metadataPluts: MembershipMetadata = datum.fields[3];

    // Get wallet address and token details
    const walletAddress = serializeAddressObj(metadataPluts.fields[0]);
    const policyId = datum.fields[0].list[0].bytes;
    const assetName = datum.fields[0].list[1].bytes;
    const tokenUnit = policyId + assetName;

    // Fetch UTxOs for the wallet address
    const utxos = await blockfrostService.fetchAddressUTxOs(walletAddress);

    // Find UTxO containing the token
    const tokenUtxo = utxos.find((utxo) => {
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
};
