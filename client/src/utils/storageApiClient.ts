interface StorageApiResponse<T = any> {
  success?: boolean;
  data?: T;
  exists?: boolean;
  deleted?: boolean;
  files?: string[];
  error?: string;
}

export class StorageApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'StorageApiError';
  }
}

async function makeStorageRequest<T = any>(
  action: string,
  params: Record<string, any>
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
    throw new StorageApiError(result.error || 'Storage API request failed', response.status);
  }

  return result;
}

export const storageApiClient = {
  async save(
    filename: string,
    content: Record<string, any>,
    subfolder: string
  ): Promise<void> {
    await makeStorageRequest('save', {
      filename,
      content,
      subfolder,
    });
  },

  async get<T>(filename: string, subfolder?: string): Promise<T | null> {
    const response = await makeStorageRequest<T>('get', {
      filename,
      subfolder,
    });
    return response.data ?? null;
  },

  async exists(filename: string, subfolder?: string): Promise<boolean> {
    const response = await makeStorageRequest('exists', {
      filename,
      subfolder,
    });
    return response.exists ?? false;
  },

  async delete(filename: string, subfolder?: string): Promise<boolean> {
    const response = await makeStorageRequest('delete', {
      filename,
      subfolder,
    });
    return response.deleted ?? false;
  },

  async list(subfolder?: string): Promise<string[]> {
    const response = await makeStorageRequest('list', {
      subfolder,
    });
    return response.files ?? [];
  },
};