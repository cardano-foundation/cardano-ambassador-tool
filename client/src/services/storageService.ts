import fs from 'fs/promises';
import path from 'path';

const STORAGE_ROOT = path.join(process.cwd(), 'storage');

interface StorageOptions {
  filename: string;
  content: Record<string, any>;
  subfolder?: string;
}

export const storageService = {
  async save(
    filename: string,
    content: Record<string, any>,
    subfolder: string,
  ): Promise<void> {
    const dir = subfolder ? path.join(STORAGE_ROOT, subfolder) : STORAGE_ROOT;
    const filepath = path.join(dir, `${filename}.json`);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filepath, JSON.stringify(content, null, 2));
  },

  async get<T>(filename: string, subfolder?: string): Promise<T | null> {
    const dir = subfolder ? path.join(STORAGE_ROOT, subfolder) : STORAGE_ROOT;

    const filepath = path.join(dir, `${filename}.json`);

    try {
      const data = await fs.readFile(filepath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  async exists(filename: string, subfolder?: string): Promise<boolean> {
    const dir = subfolder ? path.join(STORAGE_ROOT, subfolder) : STORAGE_ROOT;
    const filepath = path.join(dir, `${filename}.json`);

    try {
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  },

  async delete(filename: string, subfolder?: string): Promise<boolean> {
    const dir = subfolder ? path.join(STORAGE_ROOT, subfolder) : STORAGE_ROOT;
    const filepath = path.join(dir, `${filename}.json`);

    try {
      await fs.unlink(filepath);
      return true;
    } catch {
      return false;
    }
  },

  async list(subfolder?: string): Promise<string[]> {
    const dir = subfolder ? path.join(STORAGE_ROOT, subfolder) : STORAGE_ROOT;

    try {
      const files = await fs.readdir(dir);
      return files
        .filter((f) => f.endsWith('.json'))
        .map((f) => f.replace('.json', ''));
    } catch {
      return [];
    }
  },
};
