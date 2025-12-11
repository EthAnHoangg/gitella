import React from 'react';
import { ReportData, Commit } from '../types';
import { Card } from './Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ReportViewProps {
  report: ReportData;
  commits: Commit[];
  repoName: string;
  onReset: () => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#2B1810] p-4 border-2 border-white shadow-[8px_8px_0px_0px_#E20613] z-50">
        <p className="text-[#FFC107] font-black uppercase text-sm mb-2 border-b-2 border-white/20 pb-1">
          {label}
        </p>
        <p className="text-white font-mono font-bold text-xl">
          {payload[0].value} <span className="text-sm text-gray-400 font-sans font-normal uppercase">Commits</span>
        </p>
      </div>
    );
  }
  return null;
};

export const ReportView: React.FC<ReportViewProps> = ({ report, commits, repoName, onReset }) => {
  const chartData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    // Initialize chart with 0s for the range if needed, but for now just mapping commits
    // Sort commits by date first
    const sortedCommits = [...commits].sort((a, b) => 
      new Date(a.commit.author.date).getTime() - new Date(b.commit.author.date).getTime()
    );

    sortedCommits.forEach(c => {
      const date = new Date(c.commit.author.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      counts[date] = (counts[date] || 0) + 1;
    });
    
    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  }, [commits]);

  const copyReportToClipboard = () => {
    const text = `
gitella Report for ${repoName}
----------------------------------------
PRODUCTIVITY SCORE: ${report.productivityScore}/100

SUMMARY
${report.summary}

HIGHLIGHTS
${report.highlights.map(h => `- ${h}`).join('\n')}

FEATURES
${report.features.map(f => `[+] ${f.title}: ${f.description}`).join('\n')}

FIXES
${report.fixes.map(f => `[x] ${f.title}: ${f.description}`).join('\n')}

DEBT
${report.debt.map(d => `[-] ${d.title}: ${d.description}`).join('\n')}

STRATEGIC RECOMMENDATIONS
${report.recommendations}
    `.trim();

    navigator.clipboard.writeText(text);
    alert('Report copied to clipboard!');
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out] text-[#2B1810] relative">
      {/* Header Section */}
      <div className="bg-[#2B1810] text-[#FFC107] border-4 border-[#2B1810] p-6 shadow-[8px_8px_0px_0px_rgba(226,6,19,1)] transform -rotate-1">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none text-white">
              {repoName}
            </h2>
            <p className="text-xl font-mono font-bold mt-2 text-[#FFC107]">
              /// SCOOPED {commits.length} COMMITS ///
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={copyReportToClipboard}
              className="bg-[#FFC107] text-[#2B1810] font-black text-xl px-6 py-2 border-4 border-[#2B1810] shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase"
            >
              Copy Report
            </button>
            <button
              onClick={onReset}
              className="bg-[#E20613] text-white font-black text-xl px-6 py-2 border-4 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase"
            >
              Analyze Another ↻
            </button>
          </div>
        </div>
      </div>

      {/* Flavor Profile & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 flex flex-col justify-between items-center text-center" color="bg-[#FDFBF7]" rotate={true}>
          <div className="w-full">
            <h3 className="text-2xl font-black uppercase border-b-4 border-[#2B1810] pb-2 mb-4 text-[#2B1810]">Productivity Score</h3>
            <div className="relative inline-block">
              <span className="text-9xl font-black text-[#E20613] tracking-tighter relative z-10">{report.productivityScore}</span>
              <span className="absolute top-2 left-2 text-9xl font-black text-[#2B1810] -z-0 blur-[1px] opacity-20">{report.productivityScore}</span>
            </div>

            <div className="mt-4 transform rotate-2">
              <span className="font-black text-xl bg-[#2B1810] text-[#FFC107] px-4 py-2 border-2 border-white shadow-[4px_4px_0px_0px_rgba(226,6,19,1)]">
                {report.productivityScore > 80 ? "HIGH VELOCITY 🚀" : report.productivityScore > 50 ? "STEADY PROGRESS 📈" : "NEEDS IMPROVEMENT ⚠️"}
              </span>
            </div>
            <div className="mt-4 text-xs font-bold text-gray-500 uppercase tracking-widest border-t-2 border-gray-200 pt-2">
              AI-CALCULATED BASED ON VELOCITY, CODE VOLUME, AND SHIPPING MOMENTUM
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2 flex flex-col" title="Executive Summary" color="bg-white" rotate={true}>
          <p className="text-xl md:text-2xl leading-normal font-bold text-[#2B1810] flex-grow font-mono">
            "{report.summary}"
          </p>
          <div className="mt-8">
            <div className="flex flex-wrap gap-3">
              {report.highlights.map((h, i) => (
                <span key={i} className="bg-[#FFC107] text-[#2B1810] border-4 border-[#2B1810] px-4 py-2 font-black text-lg shadow-[4px_4px_0px_0px_rgba(43,24,16,1)] hover:-translate-y-1 transition-transform cursor-default">
                  {h}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Breakdown Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card title="Key Features" color="bg-[#CAFFBF]">
          <ul className="space-y-4">
            {report.features.map((item, idx) => (
              <li key={idx} className="bg-white border-4 border-[#2B1810] p-4 shadow-[4px_4px_0px_0px_rgba(43,24,16,1)] hover:bg-[#2B1810] hover:text-[#CAFFBF] transition-colors group">
                <div className="font-black text-lg uppercase group-hover:text-[#CAFFBF] break-words">{item.title}</div>
                <div className="text-base font-bold mt-1 leading-snug opacity-80 group-hover:opacity-100 break-words">{item.description}</div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Bug Fixes" color="bg-[#FFADAD]">
          <ul className="space-y-4">
            {report.fixes.map((item, idx) => (
              <li key={idx} className="bg-white border-4 border-[#2B1810] p-4 shadow-[4px_4px_0px_0px_rgba(43,24,16,1)] hover:bg-[#2B1810] hover:text-[#FFADAD] transition-colors group">
                <div className="font-black text-lg uppercase group-hover:text-[#FFADAD] break-words">{item.title}</div>
                <div className="text-base font-bold mt-1 leading-snug opacity-80 group-hover:opacity-100 break-words">{item.description}</div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Technical Debt" color="bg-[#A0C4FF]">
          <ul className="space-y-4">
            {report.debt.map((item, idx) => (
              <li key={idx} className="bg-white border-4 border-[#2B1810] p-4 shadow-[4px_4px_0px_0px_rgba(43,24,16,1)] hover:bg-[#2B1810] hover:text-[#A0C4FF] transition-colors group">
                <div className="font-black text-lg uppercase group-hover:text-[#A0C4FF] break-words">{item.title}</div>
                <div className="text-base font-bold mt-1 leading-snug opacity-80 group-hover:opacity-100 break-words">{item.description}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Chart & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Daily Activity" color="bg-white">
          <div className="h-80 w-full bg-[#FDFBF7] border-4 border-[#2B1810] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="date"
                  tick={{ fontFamily: 'Space Grotesk', fontSize: 12, fill: '#2B1810', fontWeight: 'bold' }}
                  axisLine={{ stroke: '#2B1810', strokeWidth: 4 }}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#FFC107', opacity: 0.5 }}
                  content={<CustomTooltip />}
                />
                <Bar dataKey="count" fill="#2B1810" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Strategic Recommendations 🎯" color="#D0D1FF" rotate={true}>
          <div className="bg-white border-4 border-[#2B1810] p-6 shadow-[4px_4px_0px_0px_rgba(43,24,16,1)] h-full">
            <p className="text-xl font-bold font-mono leading-relaxed whitespace-pre-wrap text-[#2B1810]">
              {report.recommendations}
            </p>
          </div>
        </Card>
      </div>

      <Card title="Raw Receipts (Commits)" color="bg-white" className="text-[#2B1810]">
        <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          <ul className="space-y-4">
            {commits.map((c) => {
              const lines = c.commit.message.split('\n');
              const subject = lines[0];
              const body = lines.slice(1).join('\n').trim();

              return (
                <li key={c.sha} className="border-4 border-[#2B1810] p-4 hover:bg-[#FDFBF7] transition-colors relative">
                  <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={c.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-black font-mono text-sm bg-[#2B1810] text-white px-2 py-1 hover:bg-[#E20613] transition-colors"
                      >
                        {c.sha.substring(0, 7)}
                      </a>
                      <span className="font-bold text-sm text-[#2B1810]">{c.commit.author.name}</span>
                    </div>
                    <span className="text-xs font-black text-[#2B1810] uppercase tracking-wide bg-[#FFC107] px-2 py-1 border-2 border-[#2B1810]">
                      {new Date(c.commit.author.date).toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="font-black text-lg leading-tight text-[#2B1810] mb-2">{subject}</p>
                  
                  {body && (
                    <pre className="bg-[#F0F0F0] border-2 border-[#2B1810] p-3 text-sm font-mono whitespace-pre-wrap text-[#2B1810]">
                      {body}
                    </pre>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </Card>
    </div>
  );
};