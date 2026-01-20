import { GithubProposalData } from '@types';
import { Octokit } from 'octokit';
import crypto from 'crypto';

const GitContentService = {
  async saveContent({
    title,
    description,
    submitterAddress,
  }: GithubProposalData & { submitterAddress?: string }) {
    const { owner, repo, branch, octokit } = await getOctokit();
    
    const contentHash = crypto.createHash('md5')
      .update(`${title}-${submitterAddress || 'anonymous'}`)
      .digest('hex')
      .substring(0, 8);
    
    const filename = `proposal-${contentHash}.md`;
    const path = `proposals-applications/content/${filename}`;

    try {
      let sha;
      try {
        const { data: existing } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path,
          ref: branch,
        });
        if ('sha' in existing) {
          sha = existing.sha;
        }
      } catch (error: any) {
        if (error.status !== 404) {
          throw error;
        }
      }

      const { data } = await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: sha ? `Update ${filename}` : `Create ${filename}`,
        content: Buffer.from(description).toString('base64'),
        branch,
        ...(sha && { sha }),
      });

      return { ...data, filename };
    } catch (error: any) {
      console.error('GitHub API Error:', {
        status: error.status,
        message: error.message,
        path,
      });
      throw error;
    }
  },

  async readContent(filename: string) {
    if (!filename || !/^[a-zA-Z0-9_-]+\.md$/.test(filename.trim())) {
      throw new Error('Invalid filename format');
    }

    const { owner, repo, branch, octokit } = await getOctokit();
    const path = `proposals-applications/content/${filename.trim()}`;

    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });

      if ('content' in data) {
        return {
          filename: filename.trim(),
          content: Buffer.from(data.content, 'base64').toString('utf-8'),
        };
      }
      throw new Error('File content not available');
    } catch (error: any) {
      if (error.status === 404) throw new Error('Proposal file not found');
      if (error.status === 401 || error.status === 403)
        throw new Error('GitHub authentication failed');
      throw new Error('Failed to read content from GitHub');
    }
  },

  async deleteContent(filename: string) {
    const { owner, repo, branch, octokit } = await getOctokit();
    const path = `proposals-applications/content/${filename}`;

    try {
      const { data: existing } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });

      if ('sha' in existing) {
        await octokit.rest.repos.deleteFile({
          owner,
          repo,
          path,
          message: `Delete proposal ${filename}`,
          sha: existing.sha,
          branch,
        });
        return true;
      }
      return false;
    } catch (error: any) {
      if (error.status === 404) return false;
      throw error;
    }
  },
};

const getOctokit = async () => {
  const {
    GITHUB_TOKEN,
    NEXT_PUBLIC_GITHUB_REPO,
    NEXT_PUBLIC_GITHUB_BRANCH = 'main',
  } = process.env;

  if (!GITHUB_TOKEN || !NEXT_PUBLIC_GITHUB_REPO) {
    throw new Error('GitHub credentials missing in environment variables');
  }

  const [owner, repo] = NEXT_PUBLIC_GITHUB_REPO.split('/');
  const octokit = new Octokit({ auth: GITHUB_TOKEN });
  
  return { owner, repo, branch: NEXT_PUBLIC_GITHUB_BRANCH, octokit };
};

export default GitContentService;
