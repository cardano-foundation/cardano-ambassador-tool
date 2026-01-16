/**
 * Standalone script to test parsing plutusData locally
 *
 * Usage:
 * 1. Replace the plutusData string below with your own
 * 2. Run: npx tsx test-plutus-data.ts
 */

import { getMemberDatum, getProposalDatum, getMembershipIntentDatum } from './src/lib/utils';
import { UTxO } from '@meshsdk/core';

// ============================================================================
// Replace this with your actual plutusData from the blockchain
// ============================================================================
// IMPORTANT: The sample data below is a placeholder. Replace it with real plutusData from your UTxO.
// You can get this from:
// 1. Blockfrost API: /txs/{hash}/utxos endpoint
// 2. Your wallet provider
// 3. Cardano Explorer/Cardanoscan
const YOUR_PLUTUS_DATA = 'REPLACE_WITH_YOUR_PLUTUS_DATA';

// Choose which function to test: 'member', 'proposal', or 'membershipIntent'
const TEST_TYPE: 'member' | 'proposal' | 'membershipIntent' = 'member';

// ============================================================================
// Test execution
// ============================================================================

function createMockUtxo(plutusData: string): UTxO {
  return {
    input: {
      outputIndex: 0,
      txHash: 'test-tx-hash-' + Date.now(),
    },
    output: {
      address: 'addr_test1234',
      amount: [{ unit: 'lovelace', quantity: '2000000' }],
      plutusData: plutusData,
    },
  };
}

function testMemberDatum(plutusData: string) {
  console.log('\n🔍 Testing getMemberDatum...\n');
  console.log('PlutusData:', plutusData, '\n');

  const mockUtxo = createMockUtxo(plutusData);

  try {
    const result = getMemberDatum(mockUtxo);
    console.log('✅ SUCCESS! Parsed member datum:\n');
    console.log('Token:', result.token);
    console.log('Fund Received:', result.fundReceived);
    console.log('Completion entries:', result.completion.size);
    console.log('\nMetadata:');
    console.log('  Wallet Address:', result.metadata.walletAddress);
    console.log('  Full Name:', result.metadata.fullName || '(empty)');
    console.log('  Display Name:', result.metadata.displayName || '(empty)');
    console.log('  Email:', result.metadata.emailAddress || '(empty)');
    console.log('  Bio:', result.metadata.bio || '(empty)');
    console.log('  Country:', result.metadata.country || '(empty)');
    console.log('  City:', result.metadata.city || '(empty)');
    console.log('  X Handle:', result.metadata.x_handle || '(empty)');
    console.log('  GitHub:', result.metadata.github || '(empty)');
    console.log('  Discord:', result.metadata.discord || '(empty)');
    console.log('  SPO ID:', result.metadata.spo_id || '(empty)');
    console.log('  DRep ID:', result.metadata.drep_id || '(empty)');
    console.log('\n📋 Full result:');
    console.log(JSON.stringify(result, (key, value) => {
      // Convert Map to object for better display
      if (value instanceof Map) {
        return Array.from(value.entries());
      }
      return value;
    }, 2));
  } catch (error) {
    console.error('❌ FAILED to parse member datum:');
    console.error(error);
    process.exit(1);
  }
}

function testProposalDatum(plutusData: string) {
  console.log('\n🔍 Testing getProposalDatum...\n');
  console.log('PlutusData:', plutusData, '\n');

  const mockUtxo = createMockUtxo(plutusData);

  try {
    const result = getProposalDatum(mockUtxo);
    console.log('✅ SUCCESS! Parsed proposal datum:\n');
    console.log('Fund Requested:', result.fundRequested);
    console.log('Receiver:', result.receiver);
    console.log('Member:', result.member);
    console.log('\nMetadata:');
    console.log('  Title:', result.metadata.title || '(empty)');
    console.log('  URL:', result.metadata.url || '(empty)');
    console.log('  Funds Requested:', result.metadata.fundsRequested || '(empty)');
    console.log('  Receiver Address:', result.metadata.receiverWalletAddress);
    console.log('  Submitted By:', result.metadata.submittedByAddress);
    console.log('  Status:', result.metadata.status || '(empty)');
    console.log('\n📋 Full result:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ FAILED to parse proposal datum:');
    console.error(error);
    process.exit(1);
  }
}

function testMembershipIntentDatum(plutusData: string) {
  console.log('\n🔍 Testing getMembershipIntentDatum...\n');
  console.log('PlutusData:', plutusData, '\n');

  const mockUtxo = createMockUtxo(plutusData);

  try {
    const result = getMembershipIntentDatum(mockUtxo);
    console.log('✅ SUCCESS! Parsed membership intent datum:\n');
    console.log('Policy ID:', result.policyId);
    console.log('Asset Name:', result.assetName);
    console.log('\nMetadata:');
    console.log('  Wallet Address:', result.metadata.walletAddress);
    console.log('  Full Name:', result.metadata.fullName || '(empty)');
    console.log('  Display Name:', result.metadata.displayName || '(empty)');
    console.log('  Email:', result.metadata.emailAddress || '(empty)');
    console.log('  Bio:', result.metadata.bio || '(empty)');
    console.log('  Country:', result.metadata.country || '(empty)');
    console.log('  City:', result.metadata.city || '(empty)');
    console.log('  X Handle:', result.metadata.x_handle || '(empty)');
    console.log('  GitHub:', result.metadata.github || '(empty)');
    console.log('  Discord:', result.metadata.discord || '(empty)');
    console.log('  SPO ID:', result.metadata.spo_id || '(empty)');
    console.log('  DRep ID:', result.metadata.drep_id || '(empty)');
    console.log('\n📋 Full result:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ FAILED to parse membership intent datum:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
console.log('='.repeat(70));
console.log('PlutusData Parser Test');
console.log('='.repeat(70));

// Check if user has replaced the placeholder
if (YOUR_PLUTUS_DATA === 'REPLACE_WITH_YOUR_PLUTUS_DATA') {
  console.error('\n❌ ERROR: Please replace YOUR_PLUTUS_DATA with actual plutusData');
  console.error('\nTo use this test:');
  console.error('1. Open test-plutus-data.ts');
  console.error('2. Replace YOUR_PLUTUS_DATA with your real plutusData string');
  console.error('3. Set TEST_TYPE to "member", "proposal", or "membershipIntent"');
  console.error('4. Run: npm run test:plutus\n');
  process.exit(1);
}

switch (TEST_TYPE) {
  case 'member':
    testMemberDatum(YOUR_PLUTUS_DATA);
    break;
  case 'proposal':
    testProposalDatum(YOUR_PLUTUS_DATA);
    break;
  case 'membershipIntent':
    testMembershipIntentDatum(YOUR_PLUTUS_DATA);
    break;
  default:
    console.error('Invalid TEST_TYPE. Must be "member", "proposal", or "membershipIntent"');
    process.exit(1);
}

console.log('\n' + '='.repeat(70));
