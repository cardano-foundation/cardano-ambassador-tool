import { storageService } from '@/services/storageService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, filename, content, subfolder } = body;

    switch (action) {
      case 'save':
        if (!filename || !content || !subfolder) {
          return NextResponse.json(
            { error: 'Missing required parameters: filename, content, subfolder' },
            { status: 400 }
          );
        }
        await storageService.save(filename, content, subfolder);
        return NextResponse.json({ success: true });

      case 'get':
        if (!filename) {
          return NextResponse.json(
            { error: 'Missing required parameter: filename' },
            { status: 400 }
          );
        }
        const data = await storageService.get(filename, subfolder);
        return NextResponse.json({ data });

      case 'exists':
        if (!filename) {
          return NextResponse.json(
            { error: 'Missing required parameter: filename' },
            { status: 400 }
          );
        }
        const exists = await storageService.exists(filename, subfolder);
        return NextResponse.json({ exists });

      case 'delete':
        if (!filename) {
          return NextResponse.json(
            { error: 'Missing required parameter: filename' },
            { status: 400 }
          );
        }
        const deleted = await storageService.delete(filename, subfolder);
        return NextResponse.json({ deleted });

      case 'list':
        const files = await storageService.list(subfolder);
        return NextResponse.json({ files });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: save, get, exists, delete, list' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Storage API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}