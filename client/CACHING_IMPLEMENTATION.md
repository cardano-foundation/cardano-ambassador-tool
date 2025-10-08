# Cardano Ambassador Tool - Caching Implementation

## Overview

The application now implements comprehensive caching for blockchain data to improve performance, reduce API costs, and enhance user experience.

## What's Cached

### 1. Oracle UTxO
- **Function**: `findOracleUtxo()`
- **Location**: `src/lib/auth/roles.ts`
- **Cache Duration**: 24 hours (86,400 seconds)
- **Cache Key**: `['oracle-utxo']`
- **Cache Tags**: `['oracle-utxo', 'oracle-data']`

### 2. Oracle Admin Data
- **Function**: `findAdminsFromOracle()`
- **Location**: `src/lib/auth/roles.ts`
- **Cache Duration**: 24 hours (86,400 seconds)
- **Cache Key**: `['oracle-admins']`
- **Cache Tags**: `['oracle-admins', 'oracle-data']`

### 3. UTxO Data
- **API**: `/api/utxos`
- **Location**: `src/app/api/utxos/route.ts`
- **Cache Duration**: 1 hour (3,600 seconds)
- **Cache Keys**: `['address-utxos', <address>]` (unique per address)
- **Cache Tags**: `['utxos-<address>', 'all-utxos']`

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Client)                        │
│                                                             │
│  ┌──────────────┐    ┌──────────────────────────────┐     │
│  │   Refresh    │───>│  /api/revalidate endpoint    │     │
│  │   Button     │    │  (Invalidates cache tags)    │     │
│  └──────────────┘    └──────────────────────────────┘     │
│         │                                                   │
│         v                                                   │
│  ┌──────────────────────────────────────────────────┐     │
│  │         Worker fetches from /api/utxos           │     │
│  └──────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          │
                          v
┌─────────────────────────────────────────────────────────────┐
│                Next.js API Routes (Server)                  │
│                                                             │
│  ┌──────────────────────────────────────────────────┐     │
│  │  /api/utxos (with unstable_cache)                │     │
│  │  - Checks cache first                            │     │
│  │  - Fetches from Blockfrost if cache miss         │     │
│  │  - Returns cached data if available               │     │
│  └──────────────────────────────────────────────────┘     │
│                          │                                  │
│                          v                                  │
│  ┌──────────────────────────────────────────────────┐     │
│  │         Blockfrost API (Blockchain)              │     │
│  └──────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Cache Invalidation

### Automatic Revalidation
- **Oracle UTxO**: Every 24 hours
- **Oracle Admins**: Every 24 hours
- **UTxOs**: Every 1 hour

### Manual Revalidation (Hard Refresh)

#### Method 1: Refresh Button (Recommended)
Located on: `/dashboard/submissions` page

The refresh button now:
1. Invalidates all UTxO caches
2. Invalidates all oracle data (UTxO + admins)
3. Triggers worker sync for fresh data

```typescript
// Automatically handled when user clicks refresh button
handleRefresh(); // Invalidates cache + syncs data
```

#### Method 2: Direct API Call
```typescript
// Invalidate all UTxOs and all oracle data
await fetch('/api/revalidate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    allUtxos: true,
    allOracle: true 
  }),
});

// Or invalidate individually
await fetch('/api/revalidate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    oracleUtxo: true,  
    oracleAdmins: true 
  }),
});
```

#### Method 3: Invalidate Specific Tags
```typescript
await fetch('/api/revalidate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    tags: ['utxos-addr1xyz...', 'oracle-admins', 'oracle-utxo'] 
  }),
});
```

## API Endpoints

### 1. `/api/utxos` (POST)
Fetches UTxOs for a given context with caching support.

**Request Body:**
```typescript
{
  context: 'membership_intent' | 'proposal_intent' | 'member' | ...,
  address?: string,
  forceRefresh?: boolean  // Set to true to bypass cache
}
```

**Response:**
```typescript
UTxO[] // Array of UTxO objects
```

### 2. `/api/revalidate` (POST)
Manually invalidates cache tags.

**Request Body:**
```typescript
{
  allUtxos?: boolean,       // Revalidate all UTxO caches
  oracleAdmins?: boolean,   // Revalidate oracle admin cache
  tags?: string[]           // Specific cache tags to revalidate
}
```

**Response:**
```typescript
{
  success: boolean,
  message: string,
  revalidated: string[],    // Tags that were revalidated
  timestamp: string         // ISO timestamp
}
```

## Performance Benefits

### Before Caching
- **Oracle Admin Fetch**: ~500ms - 2s per request
- **UTxO Fetch**: ~300ms - 1.5s per address
- **Cost**: Every request hits Blockfrost API
- **User Experience**: Slower page loads, waiting spinners

### After Caching
- **Oracle Admin Fetch (cached)**: <10ms
- **UTxO Fetch (cached)**: <10ms
- **Cost**: Minimal API calls (only on cache miss/expiry)
- **User Experience**: Instant page loads, no waiting

### Example Scenario
1. **First Load**: Fetches from Blockfrost (~1s)
2. **Subsequent Loads**: Returns cached data (<10ms)
3. **After 1 hour**: Auto-revalidates on next request
4. **Manual Refresh**: User can force immediate refresh

## Implementation Details

### Oracle Admins Caching

```typescript
// src/lib/auth/roles.ts

// Internal fetcher (uncached)
async function fetchAdminsFromOracle() {
  const oracleUtxo = await findOracleUtxo();
  // ... parse and return admin data
}

// Exported cached version
export const findAdminsFromOracle = unstable_cache(
  fetchAdminsFromOracle,
  ['oracle-admins'],
  {
    revalidate: 86400, // 24 hours
    tags: ['oracle-admins'],
  }
);

// Manual invalidation
export async function invalidateOracleAdminsCache() {
  revalidateTag('oracle-admins');
}
```

### UTxO Caching

```typescript
// src/app/api/utxos/route.ts

// Uncached version
async function fetchAddressUTxOsUncached(address: string) {
  return await blockfrost.fetchAddressUTxOs(address);
}

// Cached version
const fetchAddressUTxOs = (address: string) =>
  unstable_cache(
    async () => fetchAddressUTxOsUncached(address),
    ['address-utxos', address],
    {
      revalidate: 3600, // 1 hour
      tags: [`utxos-${address}`, 'all-utxos'],
    }
  )();
```

## Usage Examples

### Fetching Cached Oracle Admins

```typescript
import { findAdminsFromOracle } from '@/lib/auth/roles';

// Automatically uses cache (24hr)
const adminData = await findAdminsFromOracle();
console.log(adminData.adminPubKeyHashes);
console.log(adminData.minsigners);
```

### Fetching Cached UTxOs

```typescript
// Normal fetch (uses cache)
const response = await fetch('/api/utxos', {
  method: 'POST',
  body: JSON.stringify({ 
    context: 'membership_intent' 
  }),
});
const utxos = await response.json();

// Force fresh fetch (bypasses cache)
const freshResponse = await fetch('/api/utxos', {
  method: 'POST',
  body: JSON.stringify({ 
    context: 'membership_intent',
    forceRefresh: true 
  }),
});
```

### Manual Cache Refresh

```typescript
// In a component
const handleHardRefresh = async () => {
  // Invalidate all caches
  await fetch('/api/revalidate', {
    method: 'POST',
    body: JSON.stringify({ 
      allUtxos: true, 
      oracleAdmins: true 
    }),
  });
  
  // Then fetch fresh data
  syncData('membership_intent');
};
```

## Cache Configuration

### Adjusting Cache Duration

**Oracle Admins:**
```typescript
// src/lib/auth/roles.ts
{
  revalidate: 86400,  // Current: 24 hours
  // revalidate: 3600,    // 1 hour
  // revalidate: 604800,  // 1 week
  // revalidate: false,   // Never expire (manual only)
}
```

**UTxOs:**
```typescript
// src/app/api/utxos/route.ts
{
  revalidate: 3600,   // Current: 1 hour
  // revalidate: 1800,    // 30 minutes
  // revalidate: 7200,    // 2 hours
  // revalidate: false,   // Never expire (manual only)
}
```

## Testing

### Verify Caching is Working

1. **Clear cache:**
   ```bash
   rm -rf .next/cache
   npm run dev
   ```

2. **First load:** Check network tab - should see Blockfrost API call (~1s)

3. **Reload page:** Should be instant (<10ms)

4. **Click Refresh button:** Verifies cache invalidation works

### Monitoring Cache Performance

Add logging to track cache hits:

```typescript
const start = Date.now();
const data = await findAdminsFromOracle();
console.log(`Fetch took ${Date.now() - start}ms`);
// First call: ~1000ms (cache miss)
// Cached calls: <10ms (cache hit)
```

## Best Practices

1. **Use the Refresh Button**: Let users manually refresh when needed
2. **Monitor Blockfrost Usage**: Check API call reduction in Blockfrost dashboard
3. **Adjust Cache Durations**: Based on data change frequency
4. **Handle Errors Gracefully**: Cache failures should not break the app
5. **Document Changes**: Update this file when modifying cache behavior

## Troubleshooting

### Cache Not Working
- Verify Next.js version is 13.4+
- Check that routes are using `unstable_cache`
- Ensure running in production mode for full benefits
- Clear `.next/cache` and restart

### Stale Data
- Click the refresh button
- Reduce cache duration
- Verify cache tags are correct

### High API Usage
- Check cache hit ratio
- Verify revalidation times are appropriate
- Ensure cache isn't being invalidated too frequently

## Future Enhancements

Potential improvements:
- [ ] Add Redis cache layer for distributed systems
- [ ] Implement stale-while-revalidate pattern
- [ ] Add cache warming on deployment
- [ ] Monitor cache hit rates with analytics
- [ ] Add automatic cache invalidation based on blockchain events
- [ ] Implement progressive cache warming
- [ ] Add cache statistics dashboard

## Notes

- Uses Next.js `unstable_cache` (production-ready despite name)
- Cache is shared across all users (not per-user)
- Works in both Server Components and API Routes
- Automatically handles cache revalidation
- Compatible with Next.js 14+ App Router

## Related Files

- `src/lib/auth/roles.ts` - Oracle admin caching
- `src/app/api/utxos/route.ts` - UTxO caching
- `src/app/api/revalidate/route.ts` - Cache invalidation API
- `src/app/dashboard/submissions/page.tsx` - Refresh button implementation
- `public/db-worker.js` - Worker that fetches cached data

---

**Last Updated**: 2025-10-04  
**Next.js Version**: 14.x  
**Status**: ✅ Implemented and Active
