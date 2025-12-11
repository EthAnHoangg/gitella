

import { Commit, TrendingRepo, SearchResult } from '../types';

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

export const fetchTrendingRepos = async (): Promise<TrendingRepo[]> => {
  // Simulate "Trending" by fetching repos created in the last 10 days with the most stars
  const date = new Date();
  date.setDate(date.getDate() - 10);
  const dateString = date.toISOString().split('T')[0];

  const response = await fetch(`https://api.github.com/search/repositories?q=created:>${dateString}&sort=stars&order=desc&per_page=6`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch trending repos");
  }

  const data = await response.json();
  return data.items.map((item: any) => ({
    full_name: item.full_name,
    html_url: item.html_url,
    description: item.description,
    stargazers_count: item.stargazers_count,
    language: item.language
  })) as TrendingRepo[];
};

export const searchRepositories = async (query: string, token?: string): Promise<SearchResult[]> => {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=5`, {
    headers
  });

  if (!response.ok) {
    throw new Error("Failed to search repositories");
  }

  const data = await response.json();
  return data.items as SearchResult[];
};