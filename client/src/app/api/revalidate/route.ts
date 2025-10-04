import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

type RevalidateRequestBody = {
  tags?: string[]; // Specific tags to revalidate
  allUtxos?: boolean; // Revalidate all UTxOs
  oracleAdmins?: boolean; // Revalidate oracle admins
};

/**
 * POST /api/revalidate
 * 
 * Manual cache invalidation endpoint
 * 
 * Examples:
 * - Invalidate all UTxOs: { "allUtxos": true }
 * - Invalidate oracle admins: { "oracleAdmins": true }
 * - Invalidate specific tags: { "tags": ["utxos-addr1...", "oracle-admins"] }
 */
export async function POST(req: NextRequest) {
  try {
    const body: RevalidateRequestBody = await req.json();

    const { tags, allUtxos, oracleAdmins } = body;

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

    // Revalidate oracle admins
    if (oracleAdmins) {
      revalidateTag('oracle-admins');
      revalidated.push('oracle-admins');
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
