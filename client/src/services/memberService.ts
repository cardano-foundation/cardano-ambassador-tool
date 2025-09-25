'use client';

import { useApp } from '@/context';
import { getProvider } from '@/utils';
import { deserializeDatum, PubKeyAddress, ScriptAddress, serializeAddressObj, UTxO } from '@meshsdk/core';
import { MembershipIntentDatum, MembershipMetadata } from '@sidan-lab/cardano-ambassador-tool';

// Environment variables
// const ORACLE_TX_HASH = process.env.NEXT_PUBLIC_ORACLE_TX_HASH!;
// const ORACLE_OUTPUT_INDEX = parseInt(
//   process.env.NEXT_PUBLIC_ORACLE_OUTPOUT_INDEX || '0',
// );
