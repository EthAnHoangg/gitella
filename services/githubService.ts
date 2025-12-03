import { Commit } from '../types';

export const parseRepoUrl = (url: string): { owner: string; repo: string } | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      return { owner: pathParts[0], repo: pathParts[1] };
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const fetchCommits = async (
  owner: string, 
  repo: string, 
  startDate: string, 
  endDate: string,
  token?: string
): Promise<Commit[]> => {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const query = new URLSearchParams({
    since: new Date(startDate).toISOString(),
    until: new Date(endDate).toISOString(),
    per_page: '100', // Limit to 100 for this demo to avoid massive context
  });

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?${query}`, {
    headers
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("GitHub API rate limit exceeded. Please provide a token.");
    }
    if (response.status === 404) {
      throw new Error("Repository not found. Check the URL or privacy settings.");
    }
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data as Commit[];
};
