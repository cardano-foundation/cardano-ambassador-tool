import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

type RevalidateRequestBody = {
  tags?: string[]; // Specific tags to revalidate
  allUtxos?: boolean; // Revalidate all UTxOs
  oracleAdmins?: boolean; // Revalidate oracle admins
  oracleUtxo?: boolean; // Revalidate oracle UTxO
  allOracle?: boolean; // Revalidate all oracle data (UTxO + admins)
};

/**
 * POST /api/revalidate
 * 
 * Manual cache invalidation endpoint
 * 
 * Examples:
 * - Invalidate all UTxOs: { "allUtxos": true }
 * - Invalidate oracle admins: { "oracleAdmins": true }
 * - Invalidate oracle UTxO: { "oracleUtxo": true }
 * - Invalidate all oracle data: { "allOracle": true }
 * - Invalidate specific tags: { "tags": ["utxos-addr1...", "oracle-admins"] }
 */
export async function POST(req: NextRequest) {
  try {
    const body: RevalidateRequestBody = await req.json();

    const { tags, allUtxos, oracleAdmins, oracleUtxo, allOracle } = body;

    // Track what was revalidated
    const revalidated: string[] = [];

    // Revalidate specific tags
    if (tags && Array.isArray(tags)) {
      tags.forEach((tag) => {
        revalidateTag(tag);
        revalidated.push(tag);
      });
    }

    // Revalidate all UTxOs
    if (allUtxos) {
      revalidateTag('all-utxos');
      revalidated.push('all-utxos');
    }

    // Revalidate all oracle data (UTxO + admins)
    if (allOracle) {
      revalidateTag('oracle-data');
      revalidateTag('oracle-admins');
      revalidateTag('oracle-utxo');
      revalidated.push('oracle-data', 'oracle-admins', 'oracle-utxo');
    } else {
      // Individual oracle cache invalidation
      if (oracleAdmins) {
        revalidateTag('oracle-admins');
        revalidated.push('oracle-admins');
      }

      if (oracleUtxo) {
        revalidateTag('oracle-utxo');
        revalidated.push('oracle-utxo');
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Cache revalidated successfully',
        revalidated,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to revalidate cache',
      },
      { status: 500 }
    );
  }
}
