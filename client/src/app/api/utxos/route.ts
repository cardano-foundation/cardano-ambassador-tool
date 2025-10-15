// import { BlockfrostProvider, UTxO } from '@meshsdk/core';
// import { scripts } from '@sidan-lab/cardano-ambassador-tool';
// import { NextRequest, NextResponse } from 'next/server';
// import { unstable_cache, revalidateTag } from 'next/cache';

// // Validate required environment variables
// if (!process.env.BLOCKFROST_API_KEY_PREPROD) {
//   throw new Error(
//     'BLOCKFROST_API_KEY_PREPROD environment variable is required',
//   );
// }

// const blockfrost = new BlockfrostProvider(
//   process.env.BLOCKFROST_API_KEY_PREPROD,
// );

// const allScripts = scripts({
//   oracle: {
//     txHash: process.env.NEXT_PUBLIC_ORACLE_SETUP_TX_HASH!,
//     outputIndex: parseInt(process.env.NEXT_PUBLIC_ORACLE_SETUP_OUTPUT_INDEX!),
//   },
//   counter: {
//     txHash: process.env.NEXT_PUBLIC_COUNTER_SETUP_TX_HASH!,
//     outputIndex: parseInt(process.env.NEXT_PUBLIC_COUNTER_SETUP_OUTPUT_INDEX!),
//   },
// });

// const SCRIPT_ADDRESSES = {
//   MEMBERSHIP_INTENT: allScripts.membershipIntent.spend.address,
//   MEMBER_NFT: allScripts.member.spend.address,
//   PROPOSE_INTENT: allScripts.proposeIntent.spend.address,
//   PROPOSAL: allScripts.proposal.spend.address,
//   SIGN_OFF_APPROVAL: allScripts.signOffApproval.spend.address,
// } as const;

// const POLICY_IDS = {
//   MEMBER_NFT: allScripts.member.mint.hash,
// } as const;

// const actionData = {
//   sign_of_approval: {
//     errorContext: 'sign off approval',
//     address: SCRIPT_ADDRESSES.SIGN_OFF_APPROVAL,
//   },
//   members: {
//     errorContext: 'Member',
//     address: SCRIPT_ADDRESSES.MEMBER_NFT,
//   },
//   membership_intent: {
//     errorContext: 'Membership Intent',
//     address: SCRIPT_ADDRESSES.MEMBERSHIP_INTENT,
//   },
//   proposals: {
//     errorContext: 'Proposal',
//     address: SCRIPT_ADDRESSES.PROPOSAL,
//   },
//   proposal_intent: {
//     errorContext: 'Proposal Intent',
//     address: SCRIPT_ADDRESSES.PROPOSE_INTENT,
//   },
//   specific_address_utxos: {
//     errorContext: 'Address',
//     address: '',
//   },
// } as const;

// type ContextType = keyof typeof actionData;

// type HandlerRequestBody = {
//   context: ContextType;
//   address: string;
//   forceRefresh?: boolean; 
// };

// export async function POST(req: NextRequest): Promise<
//   | NextResponse<{
//       error: string;
//     }>
//   | NextResponse<UTxO[]>
// > {
//   try {
//     const body: HandlerRequestBody = await req.json();

//     const { context, address, forceRefresh } = body;

//     const action = actionData[context];

//     if (!action) {
//       return NextResponse.json({ error: 'Invalid context' }, { status: 400 });
//     }

//     const userAddress = address ?? action.address;

//     if (forceRefresh) {
//       revalidateTag(`utxos-${userAddress}`);
//       revalidateTag('all-utxos');
//     }

//     const utxos = await fetchAddressUTxOs(userAddress);

//     console.log({context, address,utxos});
    

//     const validUtxos =
//       context == 'specific_address_utxos'
//         ? utxos
//         : utxos.filter((utxo) => utxo.output.plutusData);

//     return NextResponse.json(validUtxos, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 },
//     );
//   }
// }

// // Uncached version - does actual blockchain fetch
// async function fetchAddressUTxOsUncached(address: string): Promise<UTxO[]> {
//   try {
//     const utxos = await blockfrost.fetchAddressUTxOs(address);

//     return Array.isArray(utxos) ? utxos : [];
//   } catch (error) {
//     return [];
//   }
// }

// // Cached version with 1 hour revalidation
// const fetchAddressUTxOs = (address: string) =>
//   unstable_cache(
//     async () => fetchAddressUTxOsUncached(address),
//     ['address-utxos', address], 
//     {
//       revalidate: 3600, // Cache for 1 hour 
//       tags: [`utxos-${address}`, 'all-utxos'], 
//     }
//   )();




import { scripts } from '@sidan-lab/cardano-ambassador-tool';
import { NextRequest, NextResponse } from 'next/server';

// Validate required environment variables
if (!process.env.BLOCKFROST_API_KEY_PREPROD) {
  throw new Error(
    'BLOCKFROST_API_KEY_PREPROD environment variable is required',
  );
}

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

const SCRIPT_ADDRESSES = {
  MEMBERSHIP_INTENT: allScripts.membershipIntent.spend.address,
  MEMBER_NFT: allScripts.member.spend.address,
  PROPOSE_INTENT: allScripts.proposeIntent.spend.address,
  PROPOSAL: allScripts.proposal.spend.address,
  SIGN_OFF_APPROVAL: allScripts.signOffApproval.spend.address,
} as const;

const actionData = {
  sign_of_approval: {
    errorContext: 'sign off approval',
    address: SCRIPT_ADDRESSES.SIGN_OFF_APPROVAL,
  },
  members: {
    errorContext: 'Member',
    address: SCRIPT_ADDRESSES.MEMBER_NFT,
  },
  membership_intent: {
    errorContext: 'Membership Intent',
    address: SCRIPT_ADDRESSES.MEMBERSHIP_INTENT,
  },
  proposals: {
    errorContext: 'Proposal',
    address: SCRIPT_ADDRESSES.PROPOSAL,
  },
  proposal_intent: {
    errorContext: 'Proposal Intent',
    address: SCRIPT_ADDRESSES.PROPOSE_INTENT,
  },
  specific_address_utxos: {
    errorContext: 'Address',
    address: '',
  },
} as const;

type ContextType = keyof typeof actionData;

type HandlerRequestBody = {
  context: ContextType;
  address: string;
  forceRefresh?: boolean; 
};

// Direct Blockfrost API call
async function fetchUTxOsDirectly(address: string): Promise<any[]> {
  try {
    const response = await fetch(
      `https://cardano-preprod.blockfrost.io/api/v0/addresses/${address}/utxos`,
      {
        headers: {
          'project_id': process.env.BLOCKFROST_API_KEY_PREPROD!,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Blockfrost API error: ${response.status}`);
    }

    const utxos = await response.json();
    console.log(`Direct Blockfrost API returned ${utxos.length} UTxOs for ${address}`);
    
    // Log the structure of the first UTxO to see what we're getting
    if (utxos.length > 0) {
      console.log('Direct API - First UTxO structure:', {
        address: utxos[0].address,
        tx_hash: utxos[0].tx_hash,
        output_index: utxos[0].output_index,
        inline_datum: utxos[0].inline_datum,
        data_hash: utxos[0].data_hash,
        amount: utxos[0].amount
      });
    }
    
    return utxos;
  } catch (error) {
    console.error('Error in direct Blockfrost call:', error);
    return [];
  }
}

// Convert Blockfrost format to Mesh UTxO format
function convertToMeshUTxO(blockfrostUtxo: any): any {
  return {
    input: {
      txHash: blockfrostUtxo.tx_hash,
      outputIndex: blockfrostUtxo.output_index,
    },
    output: {
      address: blockfrostUtxo.address,
      amount: blockfrostUtxo.amount,
      dataHash: blockfrostUtxo.data_hash || undefined,
      plutusData: blockfrostUtxo.inline_datum || undefined,
      inline_datum: blockfrostUtxo.inline_datum || undefined, // Keep original too
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: HandlerRequestBody = await req.json();
    const { context, address, forceRefresh } = body;

    console.log('API CALLED with:', { context, address, forceRefresh });

    const action = actionData[context];
    if (!action) {
      console.log('Invalid context:', context);
      return NextResponse.json({ error: 'Invalid context' }, { status: 400 });
    }

    const userAddress = address ?? action.address;
    console.log('Target address:', userAddress);

    if (!userAddress) {
      console.log('No address available for context:', context);
      return NextResponse.json({ error: 'No address available' }, { status: 400 });
    }

    // Use direct Blockfrost API call instead of Mesh SDK
    console.log('Fetching UTxOs directly from Blockfrost for address:', userAddress);
    const blockfrostUtxos = await fetchUTxOsDirectly(userAddress);
    console.log('Raw UTxOs from direct API:', blockfrostUtxos.length);

    // Convert to Mesh UTxO format
    const utxos = blockfrostUtxos.map(convertToMeshUTxO);
    console.log('Converted UTxOs:', utxos.length);

    // Filter for UTxOs with data (plutusData or inline_datum)
    const validUtxos = context === 'specific_address_utxos' 
      ? utxos 
      : utxos.filter((utxo) => {
          const hasData = utxo.output.plutusData || utxo.output.inline_datum;
          console.log(`UTxO ${utxo.input.txHash}:${utxo.input.outputIndex} has data:`, hasData);
          return hasData;
        });
    
    console.log('Valid UTxOs with data:', validUtxos.length);
    
    if (validUtxos.length > 0) {
      console.log('First valid UTxO:', {
        txHash: validUtxos[0].input.txHash,
        hasPlutusData: !!validUtxos[0].output.plutusData,
        hasInlineDatum: !!validUtxos[0].output.inline_datum
      });
    }

    return NextResponse.json(validUtxos, { status: 200 });
  } catch (error) {
    console.error('API ERROR:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
