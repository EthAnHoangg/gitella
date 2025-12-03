import React, { useState } from 'react';
import { AppStatus, Commit, ReportData } from './types';
import { parseRepoUrl, fetchCommits } from './services/githubService';
import { generateReport } from './services/geminiService';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { Input } from './components/Input';
import { ReportView } from './components/ReportView';
import { ChatWidget } from './components/ChatWidget';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  
  // Inputs
  const [repoUrl, setRepoUrl] = useState('https://github.com/facebook/react');
  const [token, setToken] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Data
  const [commits, setCommits] = useState<Commit[]>([]);
  const [report, setReport] = useState<ReportData | null>(null);

  const handleGenerate = async () => {
    setError(null);
    const repoDetails = parseRepoUrl(repoUrl);
    
    if (!repoDetails) {
      setError("Invalid GitHub URL. Must be like 'https://github.com/owner/repo'");
      return;
    }

    try {
      setStatus(AppStatus.FETCHING_GITHUB);
      const fetchedCommits = await fetchCommits(
        repoDetails.owner,
        repoDetails.repo,
        startDate,
        endDate,
        token || undefined
      );

      if (fetchedCommits.length === 0) {
        throw new Error("No commits found in this date range. Try extending it?");
      }

      setCommits(fetchedCommits);
      
      setStatus(AppStatus.GENERATING_REPORT);
      const generatedReport = await generateReport(fetchedCommits, repoDetails.repo);
      
      setReport(generatedReport);
      setStatus(AppStatus.SUCCESS);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Check console.");
      setStatus(AppStatus.ERROR);
    }
  };

  const reset = () => {
    setStatus(AppStatus.IDLE);
    setCommits([]);
    setReport(null);
  };

  return (
    // Updated selection colors to black bg / green text for high contrast
    // Added !text-black to force override any browser agent styles causing white text
    <div className="min-h-screen bg-[#E0E7FF] p-4 md:p-8 overflow-x-hidden !text-black selection:bg-black selection:text-[#B8FF9F]">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter bg-white text-black inline-block px-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-[-1deg]">
            GitRizz Reporter
          </h1>
          <p className="mt-4 text-xl font-bold font-mono text-black max-w-2xl">
            Stop writing boring status updates. Let AI roast your repo and tell your PM what's actually happening.
          </p>
        </header>

        {status === AppStatus.IDLE || status === AppStatus.ERROR || status === AppStatus.FETCHING_GITHUB || status === AppStatus.GENERATING_REPORT ? (
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Input Form */}
            <div className="lg:col-span-5 flex flex-col gap-6">
               <Card title="Input Data" className="bg-[#FFFFFC] z-10 relative text-black">
                 <div className="flex flex-col gap-5 text-black">
                   <Input 
                     label="GitHub Repo URL"
                     placeholder="e.g. https://github.com/owner/repo"
                     value={repoUrl}
                     onChange={(e) => setRepoUrl(e.target.value)}
                   />
                   
                   <div className="grid grid-cols-2 gap-4">
                     <Input 
                       label="Since"
                       type="date"
                       value={startDate}
                       onChange={(e) => setStartDate(e.target.value)}
                     />
                     <Input 
                       label="Until"
                       type="date"
                       value={endDate}
                       onChange={(e) => setEndDate(e.target.value)}
                     />
                   </div>

                   <div className="relative group">
                     <Input 
                       label="GitHub Token (Optional)"
                       type="password"
                       placeholder="ghp_xxxxxxxxxxxx"
                       value={token}
                       onChange={(e) => setToken(e.target.value)}
                       className="border-dashed"
                     />
                     <p className="text-xs mt-1 text-black font-bold">
                       * Recommended for private repos or high volume. Stored nowhere.
                     </p>
                   </div>

                   <Button 
                     onClick={handleGenerate} 
                     isLoading={status === AppStatus.FETCHING_GITHUB || status === AppStatus.GENERATING_REPORT}
                     className="mt-4 w-full"
                   >
                     {status === AppStatus.FETCHING_GITHUB ? 'STEALING COMMITS...' : 
                      status === AppStatus.GENERATING_REPORT ? 'ANALYZING VIBES...' : 
                      'GENERATE RIZZ REPORT 🚀'}
                   </Button>
                   
                   {error && (
                     <div className="bg-red-100 border-2 border-red-500 p-3 font-bold text-red-600 text-sm mt-2 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
                       ⚠️ {error}
                     </div>
                   )}
                 </div>
               </Card>

               <div className="hidden md:block bg-[#2D2D2D] p-6 text-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="font-bold text-xl mb-2 text-[#B8FF9F]">HOW IT WORKS</h3>
                  <ul className="list-disc list-inside space-y-2 font-mono text-sm opacity-90">
                    <li>Paste your repo URL.</li>
                    <li>We fetch your raw commit history.</li>
                    <li>Gemini 2.5 Flash analyzes the diffs & messages.</li>
                    <li>You get a based report to copy-paste.</li>
                  </ul>
               </div>
            </div>

            {/* Decorative / Status Area */}
            <div className="lg:col-span-7 flex items-center justify-center relative min-h-[400px]">
               {/* Background Elements */}
               <div className="absolute top-10 right-10 w-32 h-32 bg-purple-400 rounded-full border-4 border-black mix-blend-multiply opacity-50 animate-pulse"></div>
               <div className="absolute bottom-10 left-10 w-48 h-48 bg-yellow-400 rounded-none border-4 border-black rotate-12 -z-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"></div>
               
               {status === AppStatus.GENERATING_REPORT && (
                 <div className="bg-white border-4 border-black p-8 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-bounce z-20">
                    <div className="text-6xl mb-4">🧠</div>
                    <h2 className="text-3xl font-black uppercase text-black">Thinking...</h2>
                    <p className="font-mono mt-2 text-black">Connecting the dots...</p>
                 </div>
               )}

               {status === AppStatus.FETCHING_GITHUB && (
                 <div className="bg-white border-4 border-black p-8 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-pulse z-20">
                    <div className="text-6xl mb-4">📡</div>
                    <h2 className="text-3xl font-black uppercase text-black">Fetching...</h2>
                    <p className="font-mono mt-2 text-black">Talking to the Octocat...</p>
                 </div>
               )}

               {status === AppStatus.IDLE && (
                 <div className="relative z-20">
                   <div className="bg-white border-4 border-black p-8 max-w-md transform rotate-2 hover:rotate-0 transition-transform duration-300 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                      <h2 className="text-3xl font-black uppercase mb-4 leading-none text-black">Ready to<br/><span className="bg-[#B8FF9F]">Cook?</span></h2>
                      <p className="font-bold text-black">Select a repository on the left to get started.</p>
                      <div className="mt-6 flex gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-black"></div>
                        <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-black"></div>
                        <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-black"></div>
                      </div>
                   </div>
                 </div>
               )}
               
               {status === AppStatus.ERROR && (
                  <div className="bg-[#FFADAD] border-4 border-black p-8 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-md rotate-[-2deg] z-20">
                    <div className="text-6xl mb-4">💀</div>
                    <h2 className="text-3xl font-black uppercase text-black">L + RATIO</h2>
                    <p className="font-mono mt-2 font-bold text-black">Something broke. Check the error message.</p>
                  </div>
               )}
            </div>

          </main>
        ) : (
          /* Report View + Chat */
          report && (
            <>
              <ReportView 
                report={report} 
                commits={commits} 
                repoName={parseRepoUrl(repoUrl)?.repo || 'Repo'} 
                onReset={reset}
              />
              <ChatWidget commits={commits} repoName={parseRepoUrl(repoUrl)?.repo || 'Repo'} />
            </>
          )
        )}
      </div>
    </div>
  );
};

export default App;