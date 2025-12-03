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

export const ReportView: React.FC<ReportViewProps> = ({ report, commits, repoName, onReset }) => {
  // Process commits for the chart (commits per day)
  const chartData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    commits.forEach(c => {
      const date = new Date(c.commit.author.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      counts[date] = (counts[date] || 0) + 1;
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  }, [commits]);

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out] text-black">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-black">
            Report: {repoName}
          </h2>
          <p className="text-black font-medium mt-1">
            Processed {commits.length} commits. No cap.
          </p>
        </div>
        <button 
          onClick={onReset}
          className="text-sm font-bold underline hover:bg-black hover:text-white px-2 py-1 transition-colors text-black"
        >
          ← ANALYZE ANOTHER
        </button>
      </div>

      {/* Vibe Score & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 flex flex-col justify-between items-center text-center text-black" color="bg-[#FFD6FF]">
          <div className="w-full">
            <h3 className="text-xl font-bold uppercase mb-2">Vibe Score</h3>
            {/* Flexbox layout to fix overlap */}
            <div className="flex flex-row items-baseline justify-center gap-1">
              <span className="text-7xl lg:text-8xl font-black text-black tracking-tighter">{report.vibeScore}</span>
              <span className="text-2xl font-bold text-black">/100</span>
            </div>
            <div className="mt-2 flex justify-center">
              <span className="font-bold text-sm bg-black text-white px-2 py-1 rotate-[-2deg] inline-block">
                {report.vibeScore > 80 ? "ABSOLUTE FIRE 🔥" : report.vibeScore > 50 ? "COOKING 🍳" : "NEEDS WORK 💀"}
              </span>
            </div>
          </div>
          
          <div className="mt-6 border-t-2 border-black pt-3 w-full text-left">
            <p className="text-[10px] font-bold uppercase mb-1">WHAT DOES THIS MEAN?</p>
            <p className="text-xs font-medium text-black leading-tight">
              AI-calculated score based on commit velocity, code volume, and shipping momentum.
            </p>
          </div>
        </Card>

        <Card className="md:col-span-2 text-black flex flex-col" title="The Vibe Check (TL;DR)" color="bg-white">
          <p className="text-lg leading-relaxed font-medium text-black flex-grow">
            {report.summary}
          </p>
          <div className="mt-6">
            <h4 className="font-bold text-sm uppercase mb-2">Highlights:</h4>
            <div className="flex flex-wrap gap-2">
              {report.highlights.map((h, i) => (
                <span key={i} className="bg-[#FDFFB6] text-black border-2 border-black px-3 py-1 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {h}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Breakdown Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Features */}
        <Card title="Big Ws (Features)" color="bg-[#B8FF9F]" className="text-black">
          {report.features.length === 0 ? (
            <p className="opacity-50 italic text-black">No major features detected.</p>
          ) : (
            <ul className="space-y-4">
              {report.features.map((item, idx) => (
                <li key={idx} className="bg-white/50 border-2 border-black p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <div className="font-black text-sm uppercase text-black">{item.title}</div>
                  <div className="text-sm mt-1 leading-snug text-black">{item.description}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Fixes */}
        <Card title="Squashed Bugs 🐛" color="bg-[#FFADAD]" className="text-black">
           {report.fixes.length === 0 ? (
            <p className="opacity-50 italic text-black">Bug free code? Sus.</p>
          ) : (
            <ul className="space-y-4">
              {report.fixes.map((item, idx) => (
                <li key={idx} className="bg-white/50 border-2 border-black p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <div className="font-black text-sm uppercase text-black">{item.title}</div>
                  <div className="text-sm mt-1 leading-snug text-black">{item.description}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Debt/Chores */}
        <Card title="Nerd Stuff (Chores)" color="bg-[#A0C4FF]" className="text-black">
           {report.debt.length === 0 ? (
            <p className="opacity-50 italic text-black">All glory, no cleanup.</p>
          ) : (
            <ul className="space-y-4">
              {report.debt.map((item, idx) => (
                <li key={idx} className="bg-white/50 border-2 border-black p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <div className="font-black text-sm uppercase text-black">{item.title}</div>
                  <div className="text-sm mt-1 leading-snug text-black">{item.description}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Activity Chart & Next Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Grindset Visualization" color="bg-white" className="text-black">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  tick={{fontFamily: 'Space Grotesk', fontSize: 12, fill: 'black'}} 
                  axisLine={{stroke: 'black', strokeWidth: 2}}
                  tickLine={false}
                />
                <YAxis 
                  hide 
                />
                <Tooltip 
                  cursor={{fill: '#f0f0f0'}}
                  contentStyle={{
                    backgroundColor: '#fff',
                    color: '#000',
                    border: '2px solid black',
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                    borderRadius: '0px',
                    fontFamily: 'Space Grotesk',
                    fontWeight: 'bold'
                  }}
                  itemStyle={{ color: '#000' }}
                  labelStyle={{ color: '#000' }}
                />
                <Bar dataKey="count" fill="#000" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="The Prophecy (Next Steps)" color="bg-[#CAFFBF]" className="text-black">
          <div className="flex flex-col gap-3">
            {report.nextSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="bg-black text-white w-6 h-6 flex-shrink-0 flex items-center justify-center font-bold text-xs mt-1">
                  {idx + 1}
                </div>
                <p className="font-medium leading-tight text-black">{step}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Raw Receipts Section */}
      <div className="pb-20">
        <Card title="Raw Receipts (Commits)" color="bg-white" className="text-black">
          <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            <ul className="space-y-3">
              {commits.map((c) => (
                <li key={c.sha} className="border-b-2 border-dashed border-gray-300 pb-2 last:border-0 hover:bg-gray-50 transition-colors p-2">
                  <div className="flex justify-between items-start flex-wrap gap-2 mb-1">
                    <a 
                      href={c.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="font-bold font-mono text-xs bg-black text-white px-1 hover:bg-[#B8FF9F] hover:text-black transition-colors"
                    >
                      {c.sha.substring(0, 7)}
                    </a>
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                      {new Date(c.commit.author.date).toLocaleString()}
                    </span>
                  </div>
                  <p className="font-bold text-sm leading-snug">{c.commit.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                     <div className="w-2 h-2 bg-green-400 rounded-full border border-black"></div>
                     <p className="text-xs font-medium text-gray-600">{c.commit.author.name}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};