import { GithubProposalData } from '@types';
import axios from 'axios';

const GITHUB_API = 'https://api.github.com';

const GitContentService = {
  async saveContent({ title, description, submitterAddress }: GithubProposalData & { submitterAddress?: string }) {
    if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
      throw new Error('GitHub credentials missing in environment variables');
    }

    const { repo, branch, token } = loadGitCred();
    const slug = formatFilename(title);
    const filename = submitterAddress 
      ? `${slug}-${submitterAddress}.md` 
      : `${slug}.md`;
    const path = `proposals-applications/content/${filename}`;

    let sha;
    try {
      const existing = await axios.get(
        `${GITHUB_API}/repos/${repo}/contents/${path}`,
        {
          headers: { Authorization: `token ${token}` },
          params: { ref: branch },
        },
      );
      sha = existing.data.sha;
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Error checking existing file:', error.response?.data);
        throw error;
      }
    }

    try {
      const res = await axios.put(
        `${GITHUB_API}/repos/${repo}/contents/${path}`,
        {
          message: sha ? `Update ${filename}` : `Create ${filename}`,
          content: Buffer.from(description).toString('base64'),
          branch,
          ...(sha && { sha }),
        },
        {
          headers: { Authorization: `token ${token}` },
        },
      );

      return { ...res.data, filename };
    } catch (error: any) {
      console.error('GitHub API Error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        details: error.response?.data,
        repo,
        path,
      });
      throw error;
    }
  },

  async readContent(filename: string) {
    if (!filename || !/^[a-zA-Z0-9_-]+\.md$/.test(filename.trim())) {
      throw new Error('Invalid filename format');
    }

    const { repo, branch, token } = loadGitCred();
    const path = `proposals-applications/content/${filename.trim()}`;

    try {
      const res = await axios.get(
        `${GITHUB_API}/repos/${repo}/contents/${path}`,
        {
          headers: { Authorization: `token ${token}` },
          params: { ref: branch },
        },
      );

      return {
        filename: filename.trim(),
        content: Buffer.from(res.data.content, 'base64').toString('utf-8'),
      };
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 404) throw new Error('Proposal file not found');
      if (status === 401 || status === 403) throw new Error('GitHub authentication failed');
      throw new Error('Failed to read content from GitHub');
    }
  },

  async deleteContent(filename: string) {
    const { repo, branch, token } = loadGitCred();

    const path = `proposals-applications/content/${filename}`;

    const existing = await axios.get(
      `${GITHUB_API}/repos/${repo}/contents/${path}`,
      {
        headers: { Authorization: `token ${token}` },
        params: { ref: branch },
      },
    );
    const sha = existing.data.sha;

    const res = await axios.delete(
      `${GITHUB_API}/repos/${repo}/contents/${path}`,
      {
        headers: { Authorization: `token ${token}` },
        data: {
          message: `Delete proposal ${filename}`,
          sha,
          branch,
        },
      },
    );

    return true;
  },
};

const formatFilename = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

const loadGitCred = () => {
  const { GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH = 'main' } = process.env;
  const repo = GITHUB_REPO;
  const token = GITHUB_TOKEN;
  const branch = GITHUB_BRANCH;

  return { repo, token, branch };
};

export default GitContentService;
