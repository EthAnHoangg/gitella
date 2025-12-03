export interface Commit {
  sha: string;
  commit: {
    author: {
      name: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
}

export interface ReportData {
  summary: string;
  vibeScore: number; // 0 to 100
  highlights: string[];
  features: { title: string; description: string }[];
  fixes: { title: string; description: string }[];
  debt: { title: string; description: string }[];
  nextSteps: string[];
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  FETCHING_GITHUB = 'FETCHING_GITHUB',
  GENERATING_REPORT = 'GENERATING_REPORT',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
