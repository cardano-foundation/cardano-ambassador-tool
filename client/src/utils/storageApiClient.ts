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

class S3StorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(s3Client: S3Client, bucketName: string) {
    this.s3Client = s3Client;
    this.bucketName = bucketName;
  }

  private getKey(filename: string, subfolder?: string): string {
    return subfolder ? `${subfolder}/${filename}` : filename;
  }

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
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: subfolder ? `${subfolder}/` : undefined,
      });

      const response = await this.s3Client.send(command);

      if (!response.Contents) {
        return [];
      }

      return response.Contents.map((item) => item.Key)
        .filter((key): key is string => key !== undefined)
        .map((key) => {
          if (subfolder && key.startsWith(`${subfolder}/`)) {
            return key.substring(subfolder.length + 1);
          }
          return key;
        });
    } catch (error) {
      throw new StorageApiError(
        `Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
      );
    }
  }
}

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: !!process.env.S3_ENDPOINT,
  credentials:
    process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY
      ? {
          accessKeyId: process.env.S3_ACCESS_KEY,
          secretAccessKey: process.env.S3_SECRET_KEY,
        }
      : process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
});

// Export the storage client instance
export const storageApiClient = new S3StorageService(
  s3Client,
  process.env.NEXT_PUBLIC_S3_BUCKET_NAME ||
    process.env.S3_BUCKET_NAME ||
    'your-bucket-name',
);
