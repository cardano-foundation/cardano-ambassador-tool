// @/utils/storageApiClient.ts
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Storage operations are proxied to the Next.js API routes.

export class StorageApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'StorageApiError';
  }
}

async function makeStorageRequest<T = any>(
  action: string,
  params: Record<string, any>,
): Promise<any> {
  const response = await fetch('/api/storage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      ...params,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new StorageApiError(
      result.error || 'Storage API request failed',
      response.status,
    );
  }

  return result;
}

export const storageApiClient = {
  async save(
    filename: string,
    content: Record<string, any>,
    subfolder: string,
  ): Promise<void> {
    try {
      await makeStorageRequest('save', { filename, content, subfolder });
    } catch (error) {
      throw new StorageApiError(
        `Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
      );
    }
  },

  async get<T>(filename: string, subfolder?: string): Promise<T | null> {
    try {
      const response = await makeStorageRequest('get', { filename, subfolder });
      const result = response?.file ?? response?.content ?? response?.data ?? null;
      if (!result) return null;
      return result as T;
    } catch (error: any) {
      if (error?.status === 404 || error?.code === 'NotFound') {
        return null;
      }
      throw new StorageApiError(
        `Failed to get file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
      );
    }
  },

  async exists(filename: string, subfolder?: string): Promise<boolean> {
    try {
      const response = await makeStorageRequest('exists', { filename, subfolder });
      return !!(response?.exists ?? response?.found ?? false);
    } catch (error: any) {
      if (error?.status === 404 || error?.code === 'NotFound') {
        return false;
      }
      throw new StorageApiError(
        `Failed to check file existence: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
      );
    }
  },

  async delete(filename: string, subfolder?: string): Promise<boolean> {
    try {
      const response = await makeStorageRequest('delete', { filename, subfolder });
      return !!(response?.success ?? response?.deleted ?? true);
    } catch (error) {
      throw new StorageApiError(
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
      );
    }
  },

  async list(subfolder?: string): Promise<string[]> {
    const response = await makeStorageRequest('list', {
      subfolder,
    });
    return response.files ?? [];
  },
};
