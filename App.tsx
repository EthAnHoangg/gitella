
import React, { useState } from 'react';
import { AppStatus, Commit, ReportData, TrendingRepo } from './types';
import { parseRepoUrl, fetchCommits, fetchTrendingRepos } from './services/githubService';
import { generateReport } from './services/geminiService';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { Input } from './components/Input';
import { ReportView } from './components/ReportView';
import { ChatWidget } from './components/ChatWidget';

const CHEF_SPECIALS = [
  { name: 'Transformers', url: 'https://github.com/huggingface/transformers', desc: 'State-of-the-art ML' },
  { name: 'Diffusers', url: 'https://github.com/huggingface/diffusers', desc: 'Image Generation' },
  { name: 'React', url: 'https://github.com/facebook/react', desc: 'The UI Library' },
  { name: 'Next.js', url: 'https://github.com/vercel/next.js', desc: 'The React Framework' },
  { name: 'Tailwind CSS', url: 'https://github.com/tailwindlabs/tailwindcss', desc: 'Utility-first CSS' },
  { name: 'Vite', url: 'https://github.com/vitejs/vite', desc: 'Next Gen Tooling' },
];

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

  // Trending
  const [pantryMode, setPantryMode] = useState<'favorites' | 'trending'>('favorites');
  const [trendingRepos, setTrendingRepos] = useState<TrendingRepo[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);

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

  const handleSpecialSelect = (url: string) => {
    setRepoUrl(url);
    // Reset status to IDLE if it was ERROR to clear the error message
    if (status === AppStatus.ERROR) {
      setStatus(AppStatus.IDLE);
      setError(null);
    }
  };

  const reset = () => {
    setStatus(AppStatus.IDLE);
    setCommits([]);
    setReport(null);
  };

  const handleShowTrending = async () => {
    setPantryMode('trending');
    if (trendingRepos.length === 0) {
      setIsLoadingTrending(true);
      try {
        const repos = await fetchTrendingRepos();
        setTrendingRepos(repos);
      } catch (e) {
        console.error(e);
        // Silently fail or show small alert, for now just log
      } finally {
        setIsLoadingTrending(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 overflow-x-hidden relative selection:bg-[#2B1810] selection:text-[#E20613]">

      {/* Background Git Graph - "The Tasty Flow" - SUBTLE VERSION */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMin slice">
          {/* Master Branch - Thick Chocolate Rail */}
          <path d="M50,0 L50,100" stroke="#2B1810" strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />

          {/* Feature Branch Left - Red Swirl */}
          <path d="M50,10 C30,10 30,30 30,50 C30,70 50,70 50,90" stroke="#E20613" strokeWidth="3" fill="none" vectorEffect="non-scaling-stroke" />

          {/* Feature Branch Right - Gold Swirl */}
          <path d="M50,20 C70,20 70,40 70,60 C70,80 50,80 50,100" stroke="#FFC107" strokeWidth="3" fill="none" vectorEffect="non-scaling-stroke" />

          {/* Hotfix Branch - Dashed */}
          <path d="M50,40 C90,40 90,60 50,60" stroke="#2B1810" strokeWidth="2" strokeDasharray="5,5" fill="none" vectorEffect="non-scaling-stroke" />

          {/* Commit Nodes - Big Crunchy Hazelnuts */}
          <circle cx="50" cy="10" r="2" fill="#2B1810" stroke="white" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <circle cx="30" cy="50" r="2" fill="#E20613" stroke="white" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <circle cx="70" cy="60" r="2" fill="#FFC107" stroke="white" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <circle cx="50" cy="90" r="2" fill="#2B1810" stroke="white" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <circle cx="50" cy="40" r="1.5" fill="white" stroke="#2B1810" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <circle cx="50" cy="60" r="1.5" fill="white" stroke="#2B1810" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* Floating Commit Hashes */}
        <div className="absolute top-1/4 left-[10%] font-mono font-bold text-[#2B1810] opacity-10 text-xl rotate-[-12deg]">
          7a3f91...
        </div>
        <div className="absolute bottom-1/3 right-[10%] font-mono font-bold text-[#E20613] opacity-10 text-xl rotate-[6deg]">
          git merge --squash
        </div>
        <div className="absolute top-1/2 left-[5%] font-mono font-bold text-[#2B1810] opacity-10 text-4xl rotate-90">
          HEAD -&gt; main
        </div>
      </div>

      {/* Dripping Chocolate Header Decoration */}
      <div className="fixed top-0 left-0 w-full h-16 bg-[#2B1810] z-0" style={{ filter: 'url(#goo)' }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bg-[#2B1810] rounded-b-full animate-wiggle"
            style={{
              left: `${i * 5}%`,
              width: '60px',
              height: `${Math.random() * 80 + 40}px`,
              animationDuration: `${Math.random() * 2 + 1}s`
            }}
          />
        ))}
      </div>


      <div className="max-w-7xl mx-auto relative z-10 mt-12">

        {/* Header - Gitella Logo Style */}
        <header className="mb-16 text-center md:text-left relative">
          <div className="inline-flex flex-col md:flex-row items-center md:items-end gap-4">
            <div className="flex items-center transform -rotate-2 hover:rotate-0 transition-transform duration-300 cursor-pointer">
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-[#2B1810] drop-shadow-[4px_4px_0px_rgba(226,6,19,1)]" style={{ WebkitTextStroke: '3px white', paintOrder: 'stroke fill' }}>
                Git
              </h1>
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-[#E20613] drop-shadow-[4px_4px_0px_rgba(43,24,16,1)]" style={{ WebkitTextStroke: '3px white', paintOrder: 'stroke fill' }}>
                ella
              </h1>
            </div>
            <span className="text-xl font-bold bg-[#FFC107] text-[#2B1810] px-3 py-1 transform rotate-6 border-2 border-[#2B1810] mb-4">
              Turn Messy Commits into Smooth Reports
            </span>
          </div>

          <p className="mt-6 text-2xl font-bold text-[#2B1810] max-w-2xl leading-relaxed">
            Stop reading raw logs. Get the <span className="underline decoration-wavy decoration-[#E20613]">real scoop</span> on what's really going on in any repo. 🌰
          </p>
        </header>

        {status === AppStatus.IDLE || status === AppStatus.ERROR || status === AppStatus.FETCHING_GITHUB || status === AppStatus.GENERATING_REPORT ? (
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Input Form */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              <Card title="Ingredients (Repo)" className="bg-white z-10 relative transform rotate-1 border-[#2B1810]">
                <div className="flex flex-col gap-6">
                  <Input
                    label="GitHub Repo URL"
                    placeholder="https://github.com/owner/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="border-[#2B1810] focus:bg-[#FFE4E1]"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Since"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border-[#2B1810]"
                    />
                    <Input
                      label="Until"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border-[#2B1810]"
                    />
                  </div>

                  <div className="relative">
                    <Input
                      label="GitHub Token (Optional)"
                      type="password"
                      placeholder="ghp_xxxxxxxxxxxx"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="border-dashed border-[#2B1810]"
                    />
                    <p className="text-xs mt-2 font-bold text-[#E20613]">
                      * ONLY IF YOU NEED EXTRA FLAVOR (Private Repos)
                    </p>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    isLoading={status === AppStatus.FETCHING_GITHUB || status === AppStatus.GENERATING_REPORT}
                    className="mt-4 w-full text-2xl bg-[#E20613] text-white hover:bg-[#C40511] border-[#2B1810]"
                  >
                    {status === AppStatus.FETCHING_GITHUB ? 'SCOOPING DATA...' :
                      status === AppStatus.GENERATING_REPORT ? 'BLENDING INSIGHTS...' :
                        'GET THE SCOOP 🥄'}
                  </Button>

                  {error && (
                    <div className="bg-[#FFADAD] border-4 border-[#2B1810] p-4 font-bold text-[#2B1810] text-lg shadow-[8px_8px_0px_0px_rgba(43,24,16,1)] animate-wiggle">
                      <span className="text-3xl block mb-1">🤮 YUCK</span>
                      {error}
                    </div>
                  )}
                </div>
              </Card>

              <div className="bg-[#2B1810] p-8 text-[#FFC107] border-4 border-white shadow-[8px_8px_0px_0px_rgba(226,6,19,1)] transform -rotate-1 hidden md:block">
                <h3 className="font-black text-3xl mb-4 uppercase underline decoration-wavy decoration-[#E20613]">The Recipe</h3>
                <div className="font-mono text-lg font-bold text-white space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="opacity-50">$</span>
                    <span>git clone <span className="text-[#FFC107]">&lt;url&gt;</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="opacity-50">$</span>
                    <span>git log <span className="text-[#E20613]">--raw --scented</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="opacity-50">$</span>
                    <span>gemini merge <span className="text-[#FFC107]">--insights</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status / Decorative Area */}
            <div className="lg:col-span-7 flex flex-col justify-start min-h-[500px] relative perspective-1000 gap-8">

              {status === AppStatus.GENERATING_REPORT && (
                <div className="bg-[#FFC107] border-4 border-[#2B1810] p-12 text-center shadow-[20px_20px_0px_0px_rgba(43,24,16,1)] animate-bounce z-20 rotate-2 self-center mt-20">
                  <div className="text-8xl mb-6 animate-spin">🥣</div>
                  <h2 className="text-5xl font-black uppercase text-[#2B1810]">Mixing...</h2>
                  <p className="font-black text-xl mt-4 bg-[#2B1810] text-white px-4 py-2 inline-block">Checking consistency...</p>
                </div>
              )}

              {status === AppStatus.FETCHING_GITHUB && (
                <div className="bg-[#A0C4FF] border-4 border-[#2B1810] p-12 text-center shadow-[20px_20px_0px_0px_rgba(43,24,16,1)] animate-pulse z-20 -rotate-1 self-center mt-20">
                  <div className="text-8xl mb-6 animate-wiggle">🥄</div>
                  <h2 className="text-5xl font-black uppercase text-[#2B1810]">Scooping...</h2>
                  <p className="font-black text-xl mt-4 bg-[#2B1810] text-white px-4 py-2 inline-block">Getting raw ingredients...</p>
                </div>
              )}

              {status === AppStatus.IDLE && (
                <div className="w-full flex flex-col gap-8 animate-[fadeIn_0.5s_ease-out]">
                   {/* Intro Card */}
                  <div className="relative z-20 group cursor-pointer self-start">
                    <div className="bg-white border-4 border-[#2B1810] p-8 max-w-xl transform group-hover:rotate-1 transition-transform duration-300 shadow-[12px_12px_0px_0px_rgba(43,24,16,1)]">
                      <h2 className="text-5xl font-black uppercase mb-4 leading-none text-[#2B1810]">
                        Ready for<br />
                        <span className="text-[#E20613]">THE SCOOP?</span>
                      </h2>
                      <p className="font-bold text-lg text-gray-600">Enter a URL or pick a favorite below.</p>
                    </div>
                  </div>

                  {/* The Pantry Grid */}
                  <div>
                    <div className="flex flex-wrap gap-4 mb-6">
                      <button 
                        onClick={() => setPantryMode('favorites')}
                        className={`text-xl font-black text-[#2B1810] border-4 border-[#2B1810] px-4 py-1 transform -rotate-1 shadow-[4px_4px_0px_0px_rgba(43,24,16,1)] uppercase transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(43,24,16,1)] ${pantryMode === 'favorites' ? 'bg-[#FFC107]' : 'bg-white'}`}
                      >
                        The Pantry
                      </button>
                      <button 
                        onClick={handleShowTrending}
                        className={`text-xl font-black text-[#2B1810] border-4 border-[#2B1810] px-4 py-1 transform rotate-1 shadow-[4px_4px_0px_0px_rgba(43,24,16,1)] uppercase transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(43,24,16,1)] ${pantryMode === 'trending' ? 'bg-[#FF9F1C]' : 'bg-white'}`}
                      >
                        Trending 🔥
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {pantryMode === 'favorites' ? (
                        CHEF_SPECIALS.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSpecialSelect(item.url)}
                            className="bg-white border-4 border-[#2B1810] p-4 shadow-[4px_4px_0px_0px_rgba(43,24,16,1)] hover:bg-[#2B1810] hover:text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(255,193,7,1)] transition-all text-left group flex flex-col justify-center gap-1"
                          >
                            <div className="font-black text-xl uppercase leading-none group-hover:text-[#FFC107]">{item.name}</div>
                            <div className="font-bold text-sm opacity-60 group-hover:opacity-90">{item.desc}</div>
                          </button>
                        ))
                      ) : (
                        isLoadingTrending ? (
                           <div className="col-span-2 text-center py-8">
                              <span className="text-4xl animate-spin inline-block">⏳</span>
                              <p className="font-black text-xl mt-2">Checking the oven...</p>
                           </div>
                        ) : (
                          trendingRepos.map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSpecialSelect(item.html_url)}
                              className="bg-white border-4 border-[#2B1810] p-4 shadow-[4px_4px_0px_0px_rgba(43,24,16,1)] hover:bg-[#2B1810] hover:text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(255,159,28,1)] transition-all text-left group flex flex-col justify-center gap-1"
                            >
                              <div className="font-black text-xl uppercase leading-none group-hover:text-[#FF9F1C] truncate w-full" title={item.full_name}>{item.full_name}</div>
                              <div className="font-bold text-sm opacity-60 group-hover:opacity-90 truncate w-full">{item.description || 'No description provided'}</div>
                              <div className="flex gap-2 mt-2">
                                <span className="text-xs bg-[#2B1810] text-white px-2 py-0.5 group-hover:bg-[#FF9F1C] group-hover:text-black">★ {item.stargazers_count}</span>
                                {item.language && <span className="text-xs border-2 border-[#2B1810] px-2 py-0.5 group-hover:border-white">{item.language}</span>}
                              </div>
                            </button>
                          ))
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {status === AppStatus.ERROR && (
                <div className="bg-[#2B1810] border-4 border-white p-12 text-center shadow-[20px_20px_0px_0px_#E20613] max-w-lg rotate-[-2deg] z-20 self-center mt-10">
                  <div className="text-8xl mb-6">🥜</div>
                  <h2 className="text-5xl font-black uppercase text-[#FFADAD]">Allergy Alert</h2>
                  <p className="font-mono mt-4 font-bold text-white text-xl">{error || "Unknown Error"}</p>
                  <Button onClick={reset} variant="danger" className="mt-8 border-white">TRY AGAIN</Button>
                </div>
              )}
            </div>

          </main>
        ) : (
          /* Report View */
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
