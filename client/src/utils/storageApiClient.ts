// @/utils/storageApiClient.ts
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

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
): Promise<StorageApiResponse<T>> {
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
      const key = this.getKey(filename, subfolder);
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: JSON.stringify(content),
        ContentType: 'application/json',
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw new StorageApiError(
        `Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
      );
    }
  }

  async get<T>(filename: string, subfolder?: string): Promise<T | null> {
    try {
      const key = this.getKey(filename, subfolder);
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      const body = await response.Body?.transformToString();

      if (!body) {
        return null;
      }

      return JSON.parse(body) as T;
    } catch (error: any) {
      if (
        error.name === 'NoSuchKey' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return null;
      }
      throw new StorageApiError(
        `Failed to get file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
      );
    }
  }

  async exists(filename: string, subfolder?: string): Promise<boolean> {
    try {
      const key = this.getKey(filename, subfolder);
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error: any) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return false;
      }
      throw new StorageApiError(
        `Failed to check file existence: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
      );
    }
  }

  async delete(filename: string, subfolder?: string): Promise<boolean> {
    try {
      const key = this.getKey(filename, subfolder);
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      throw new StorageApiError(
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
      );
    }
  }

  async list(subfolder?: string): Promise<string[]> {
    const response = await makeStorageRequest('list', {
      subfolder,
    });
    return response.files ?? [];
  },
};
