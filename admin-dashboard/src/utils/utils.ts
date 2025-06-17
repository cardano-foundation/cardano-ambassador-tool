import { BlockfrostService } from "@/services";
import {
  UTxO,
  deserializeDatum,
  hexToString,
  serializeAddressObj,
} from "@meshsdk/core";
import {
  MemberData,
  MemberDatum,
  MembershipIntentDatum,
  MembershipMetadata,
} from "@sidan-lab/cardano-ambassador-tool";

const blockfrostService = new BlockfrostService();

const MEMBERSHIP_INTENT_ADDRESS =
  process.env.NEXT_PUBLIC_MEMBERSHIP_INTENT_ADDRESS ||
  "addr_test1wz60g3e02uj5wj4tw5x0qdncuarcxk6eckha4h05wsrnv5qytd3pm";
const MEMBER_NFT_ADDRESS =
  process.env.NEXT_PUBLIC_MEMBER_NFT_ADDRESS ||
  "addr_test1wq6ryevgkgj438l6j4weynx3tllnqzru6us36wgdcdr6mdcp70weg";

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

    const metadata = {
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
 * Fetches membership intent UTxOs for a given address
 * @param address The wallet address to search for
 * @returns Array of matching UTxOs with their parsed data
 */
export const fetchMembershipIntentUtxos = async (): Promise<UTxO[]> => {
  try {
    // Fetch all UTxOs at the membership intent address
    const utxos = await blockfrostService.fetchAddressUTxOs(
      MEMBERSHIP_INTENT_ADDRESS
    );

    // Filter UTxOs that have valid Plutus data and match the address
    const validUtxos = await Promise.all(
      utxos
        .filter((utxo) => utxo.output.plutusData) // Only keep UTxOs with Plutus data
        .map(async (utxo) => {
          try {
            // Parse and validate the Plutus data
            const plutusData = utxo.output.plutusData;
            if (!plutusData) {
              return null;
            }

            const parsed = parseMembershipIntentDatum(plutusData);
            if (!parsed) {
              return null;
            }

            return utxo;
          } catch (error) {
            console.error("Error parsing UTxO:", error);
            return null;
          }
        })
    );

    // Filter out null values and return valid UTxOs
    return validUtxos.filter((utxo): utxo is UTxO => utxo !== null);
  } catch (error) {
    console.error("Error fetching membership intent UTxOs:", error);
    return [];
  }
};

/**
 * Finds a member UTxO that matches the given address
 * @param address The wallet address to search for
 * @returns The matching UTxO or null if not found
 */
export const findMemberUtxo = async (address: string): Promise<UTxO | null> => {
  try {
    const utxos = await blockfrostService.fetchAddressUTxOs(MEMBER_NFT_ADDRESS);

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
      // Check if UTxO contains the token
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
