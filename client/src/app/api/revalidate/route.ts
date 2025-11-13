import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

type RevalidateRequestBody = {
  tags?: string[];
  allUtxos?: boolean;
  oracleAdmins?: boolean;
  oracleUtxo?: boolean;
  allOracle?: boolean;
  allForumProfiles?: boolean;
  forumProfile?: string;
};

/**
 * Manual cache invalidation endpoint
 *
 */
export async function POST(req: NextRequest) {
  try {
    const body: RevalidateRequestBody = await req.json();

    const {
      tags,
      allUtxos,
      oracleAdmins,
      oracleUtxo,
      allOracle,
      allForumProfiles,
      forumProfile,
    } = body;

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

    // Revalidate all forum profiles
    if (allForumProfiles) {
      revalidateTag('all-forum-profiles');
      revalidated.push('all-forum-profiles');
    }

    // Revalidate specific forum profile
    if (forumProfile) {
      revalidateTag(`forum-${forumProfile}`);
      revalidated.push(`forum-${forumProfile}`);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Cache revalidated successfully',
        revalidated,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to revalidate cache',
      },
      { status: 500 },
    );
  }
}
