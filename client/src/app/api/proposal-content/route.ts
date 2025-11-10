import GitContentService from '@/services/githubService';
import { GithubProposalData } from '@types';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/proposal-content
 *
 * Retrieves the proposal content.
 *
 * @returns The full MeshJS UTxO object if found, otherwise 404
 */
export async function GET(req: NextRequest) {
  try {
    const filename = new URL(req.url).searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 });
    }

    if (filename.length > 200 || !/^[a-zA-Z0-9_-]+\.md$/.test(filename.trim())) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const data = await GitContentService.readContent(filename);
    return NextResponse.json(data);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch content';
    const status = msg.includes('not found') ? 404 : msg.includes('authentication') ? 503 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

/**
 * POST /api/proposal-content
 *
 * Safely saves proposal content.
 *
 * @returns Success response with saved data, or error
 */
export async function POST(req: NextRequest) {
  try {
    const body: GithubProposalData & { submitterAddress?: string } =
      await req.json();
    const { title, description, submitterAddress } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Valid title and proposal description required' },
        { status: 400 },
      );
    }

    const response = await GitContentService.saveContent({
      title,
      description,
      submitterAddress,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Proposal content saved',
        data: response,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to save proposal content',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/proposal-content
 *
 * Deletes proposal content from github.
 *
 * @returns Success response or error
 */
export async function DELETE(req: NextRequest) {
  try {
    const body: { filename: string } = await req.json();

    if (!body.filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 404 },
      );
    }

    const deleted = await GitContentService.deleteContent(body.filename);

    if (!deleted) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Proposal content deleted successfully',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error deleting proposal content:', error);
    return NextResponse.json(
      { error: 'Failed to delete proposal content' },
      { status: 500 },
    );
  }
}
