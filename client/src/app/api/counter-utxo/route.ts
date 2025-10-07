import { BlockfrostService } from '@/services/blockfrostService';
import { storageService } from '@/services/storageService';
import { NextRequest, NextResponse } from 'next/server';

type CounterUtxoData = {
  txHash: string;
  outputIndex: number;
};

const blockfrost = new BlockfrostService();

/**
 * GET /api/counter-utxo
 *
 * Retrieves the currently saved counter UTxO from storage.
 * This function loads the persisted UTxO reference (transaction hash and output index)
 * from local storage and fetches the full UTxO details from Blockfrost.
 *
 * @returns The full MeshJS UTxO object if found, otherwise 404
 */
export async function GET(req: NextRequest) {
  try {
    const counter = await storageService.get<CounterUtxoData>(
      'counter_utxo',
      'counter',
    );

    if (!counter) {
      return NextResponse.json(
        { error: 'Counter UTxO not found' },
        { status: 404 },
      );
    }

    // Fetch the full UTxO details from Blockfrost
    const counterUtxo = await blockfrost.fetchUtxo(
      counter.txHash,
      counter.outputIndex,
    );

    if (!counterUtxo) {
      return NextResponse.json(
        { error: 'Counter UTxO not found on blockchain' },
        { status: 404 },
      );
    }

    return NextResponse.json(counterUtxo, { status: 200 });
  } catch (error) {
    console.error('Error fetching counter UTxO:', error);
    return NextResponse.json(
      { error: 'Failed to fetch counter UTxO' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/counter-utxo
 *
 * Safely saves a new counter UTxO reference to storage.
 * Creates a backup of the existing counter UTxO before saving the new one.
 * If the save fails, it will rollback to the previous backup.
 *
 * Request Body: { txHash: string, outputIndex: number }
 *
 * @returns Success response with saved data, or error
 */
export async function POST(req: NextRequest) {
  let backupKey: string | null = null;
  let backupData: CounterUtxoData | null = null;

  try {
    const body: CounterUtxoData = await req.json();
    const { txHash, outputIndex } = body;

    // Validation
    if (!txHash || outputIndex === undefined || outputIndex < 0) {
      return NextResponse.json(
        { error: 'Valid txHash and outputIndex are required' },
        { status: 400 },
      );
    }

    // Step 1: Backup existing counter_utxo (if any)
    const existing = await storageService.get<CounterUtxoData>(
      'counter_utxo',
      'counter',
    );

    if (existing) {
      backupKey = `counter_utxo_backup_${Date.now()}`;
      backupData = existing;
      await storageService.save(backupKey, existing, 'counter');
    }

    // Step 2: Attempt to save the new UTxO
    await storageService.save(
      'counter_utxo',
      { txHash, outputIndex },
      'counter',
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Counter UTxO saved successfully',
        data: { txHash, outputIndex },
        backup: backupKey
          ? `Backup created: ${backupKey}`
          : 'No previous counter to backup',
      },
      { status: 200 },
    );
  } catch (error) {
    // Step 3: Rollback to last backup if something goes wrong
    if (backupData) {
      try {
        await storageService.save('counter_utxo', backupData, 'counter');
      } catch (rollbackError) {
        console.error('Failed to rollback counter UTxO:', rollbackError);
      }
    }

    console.error('Error saving counter UTxO:', error);
    return NextResponse.json(
      {
        error: 'Failed to save counter UTxO',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/counter-utxo
 *
 * Deletes the current counter UTxO reference from storage.
 * Creates a backup before deletion.
 *
 * @returns Success response or error
 */
export async function DELETE(req: NextRequest) {
  try {
    // Create a backup before deleting
    const existing = await storageService.get<CounterUtxoData>(
      'counter_utxo',
      'counter',
    );

    if (existing) {
      const backupKey = `counter_utxo_deleted_${Date.now()}`;
      await storageService.save(backupKey, existing, 'counter');
    }

    // Delete the counter UTxO
    const deleted = await storageService.delete('counter_utxo', 'counter');

    if (!deleted) {
      return NextResponse.json(
        { error: 'Counter UTxO not found or already deleted' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Counter UTxO deleted successfully',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error deleting counter UTxO:', error);
    return NextResponse.json(
      { error: 'Failed to delete counter UTxO' },
      { status: 500 },
    );
  }
}
