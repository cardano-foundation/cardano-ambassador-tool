import { Redis } from "@upstash/redis";

/**
 * Multi-admin coordination store. The previous filesystem-backed
 * implementation only worked locally (Vercel Lambdas have a read-only code
 * root and an ephemeral per-instance /tmp), so partial-sig records written
 * by one admin were invisible to the next admin and the route would crash
 * on the first save attempt. Backing onto Upstash Redis gives all
 * instances a shared persistent view without changing any caller.
 *
 * Configure via env vars `UPSTASH_REDIS_REST_URL` and
 * `UPSTASH_REDIS_REST_TOKEN` (server-side only — never expose with the
 * `NEXT_PUBLIC_` prefix).
 */
const redis = Redis.fromEnv();

const keyOf = (filename: string, subfolder?: string) =>
  subfolder ? `${subfolder}:${filename}` : filename;

export const storageService = {
  async save(
    filename: string,
    content: Record<string, any>,
    subfolder: string,
  ): Promise<void> {
    await redis.set(keyOf(filename, subfolder), content);
  },

  async get<T>(filename: string, subfolder?: string): Promise<T | null> {
    return (await redis.get<T>(keyOf(filename, subfolder))) ?? null;
  },

  async exists(filename: string, subfolder?: string): Promise<boolean> {
    return (await redis.exists(keyOf(filename, subfolder))) === 1;
  },

  async delete(filename: string, subfolder?: string): Promise<boolean> {
    return (await redis.del(keyOf(filename, subfolder))) > 0;
  },

  async list(subfolder?: string): Promise<string[]> {
    const pattern = subfolder ? `${subfolder}:*` : "*";
    const prefix = subfolder ? `${subfolder}:` : "";
    const keys: string[] = [];
    let cursor: string | number = 0;
    do {
      const result: [string | number, string[]] = await redis.scan(cursor, {
        match: pattern,
        count: 100,
      });
      cursor = result[0];
      keys.push(...result[1]);
    } while (String(cursor) !== "0");
    return prefix ? keys.map((k) => k.slice(prefix.length)) : keys;
  },
};
