# Testing Guide

This guide explains how to test the plutusData parsing functions locally.

## Quick Start

### Option 1: Test with Your Own PlutusData (Recommended)

This is the fastest way to test with real data from the blockchain:

1. **Get your plutusData** from a UTxO (via Blockfrost, wallet provider, or explorer)

2. **Open `test-plutus-data.ts`** and replace the placeholder:
   ```typescript
   const YOUR_PLUTUS_DATA = 'YOUR_ACTUAL_PLUTUS_DATA_HERE';
   ```

3. **Set the test type** based on what you're testing:
   ```typescript
   const TEST_TYPE: 'member' | 'proposal' | 'membershipIntent' = 'member';
   ```

4. **Run the test**:
   ```bash
   npm run test:plutus
   ```

The script will show you:
- ✅ Success: Detailed parsed data including all metadata fields
- ❌ Failure: Exact error and stack trace

### Option 2: Run Jest Tests

Run the full test suite with predefined test cases:

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch
```

Tests are located in `src/lib/__tests__/utils.test.ts`.

## What Gets Tested

### getMemberDatum
Parses Member UTxO datum with:
- Token (policyId, assetName)
- Completion map (proposals completed)
- Fund received
- Metadata (12 fields: walletAddress, fullName, displayName, email, bio, country, city, x_handle, github, discord, spo_id, drep_id)

### getProposalDatum
Parses Proposal UTxO datum with:
- Fund requested
- Receiver address
- Member index
- Metadata (title, url, fundsRequested, receiverWalletAddress, submittedByAddress, status)

### getMembershipIntentDatum
Parses Membership Intent UTxO datum with:
- Token (policyId, assetName)
- Metadata (same 12 fields as Member)

## Testing the Fix

The recent fix handles undefined/null fields gracefully by:
1. Checking if the field exists before accessing properties
2. Returning empty string for missing data instead of crashing
3. Supporting both ByteString and List<ByteString> formats

Before the fix:
```
❌ TypeError: Cannot read properties of undefined (reading 'list')
```

After the fix:
```
✅ Returns empty string for undefined fields
```

## Example: Testing a Member UTxO

```typescript
// test-plutus-data.ts
const YOUR_PLUTUS_DATA = 'd8799f9f581c...'; // Your real plutusData
const TEST_TYPE = 'member';
```

Run:
```bash
npm run test:plutus
```

Output:
```
✅ SUCCESS! Parsed member datum:

Token: { policyId: '...', assetName: '...' }
Fund Received: 1000000
Completion entries: 2

Metadata:
  Wallet Address: addr1...
  Full Name: John Doe
  Display Name: johnd
  Email: john@example.com
  Bio: Cardano enthusiast
  Country: USA
  City: San Francisco
  ... (all fields shown)
```

## Troubleshooting

### "Cannot find module" errors
Make sure you've built the project:
```bash
npm run build
```

### Test fails with parsing error
- Verify your plutusData is valid CBOR hex
- Ensure you're using the right TEST_TYPE for your datum
- Check that the datum structure matches what the function expects

### TypeScript errors in test file
The test file uses the source TypeScript directly, so make sure:
- All dependencies are installed (`npm install`)
- TypeScript is configured correctly
