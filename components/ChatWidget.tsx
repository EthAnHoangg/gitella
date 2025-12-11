import React, { useState, useRef, useEffect } from 'react';
import { Chat } from '@google/genai';
import { Commit, ChatMessage } from '../types';
import { createRepoChat } from '../services/geminiService';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatWidgetProps {
  commits: Commit[];
  repoName: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ commits, repoName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'model', text: `Yo! I scooped ${commits.length} commits for ${repoName}. Ask me anything about the flavor.` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session when commits are available
    if (commits.length > 0 && !chatSessionRef.current) {
      try {
        chatSessionRef.current = createRepoChat(commits, repoName);
      } catch (e) {
        console.error("Failed to init chat", e);
      }
    }
  }, [commits, repoName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      const responseText = result.text;
      
      // Extract grounding sources from the response
      const groundingMetadata = result.candidates?.[0]?.groundingMetadata;
      const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => {
        if (chunk.web) {
          return { title: chunk.web.title, uri: chunk.web.uri };
        }
        return null;
      }).filter((s: any) => s !== null);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        sources: sources
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "My bad, something crashed. Try again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div className="pointer-events-auto mb-4 w-80 md:w-96 bg-white border-4 border-[#2B1810] shadow-[8px_8px_0px_0px_rgba(43,24,16,1)] flex flex-col animate-[fadeIn_0.2s_ease-out]">
          {/* Header */}
          <div className="bg-[#E20613] border-b-4 border-[#2B1810] p-3 flex justify-between items-center">
            <h3 className="font-black uppercase text-sm flex items-center gap-2 text-white">
              <span>🍫</span> Gitella Chat
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-[#2B1810] hover:text-white px-2 font-bold transition-colors text-white border-2 border-transparent hover:border-white"
            >
              X
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 flex flex-col gap-3 bg-[#FDFBF7] custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[90%] p-3 border-2 border-[#2B1810] text-sm font-bold shadow-[2px_2px_0px_0px_rgba(43,24,16,1)] ${msg.role === 'user'
                    ? 'self-end bg-[#FFC107] text-[#2B1810]'
                    : 'self-start bg-white text-[#2B1810]'
                  }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-black" {...props} />,
                    a: ({ node, ...props }) => <a className="underline hover:text-[#E20613]" {...props} />,
                    code: ({ node, ...props }) => <code className="bg-gray-200 px-1 rounded text-xs font-mono text-[#E20613]" {...props} />
                  }}
                >
                  {msg.text}
                </ReactMarkdown>

                {/* Sources Display */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t-2 border-[#2B1810]/20">
                    <p className="text-xs font-black uppercase text-[#E20613] mb-2 flex items-center gap-1">
                      <span>🔎</span> Sources found:
                    </p>
                    <div className="flex flex-col gap-2">
                      {msg.sources.map((source, idx) => (
                        <a 
                          key={idx} 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs bg-white border-2 border-[#2B1810] px-2 py-1 hover:bg-[#FFC107] hover:underline truncate block w-full transition-colors flex items-center gap-2 group"
                          title={source.title}
                        >
                          <span className="min-w-[6px] h-[6px] bg-[#2B1810] rounded-full group-hover:bg-[#E20613]"></span>
                          <span className="truncate">{source.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="self-start bg-gray-100 p-2 border-2 border-[#2B1810] text-xs font-bold animate-pulse text-[#2B1810]">
                Stirring...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t-4 border-[#2B1810] bg-white flex gap-2">
            <input
              className="flex-grow border-2 border-[#2B1810] p-2 text-sm font-bold focus:outline-none focus:bg-yellow-50 placeholder:text-gray-400 text-[#2B1810]"
              placeholder="Ask about the ingredients..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-[#2B1810] text-white px-3 font-bold hover:bg-[#E20613] disabled:opacity-50 border-2 border-[#2B1810]"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button - Only show when NOT open */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto bg-[#E20613] text-white border-4 border-[#2B1810] p-4 shadow-[4px_4px_0px_0px_rgba(43,24,16,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(43,24,16,1)] transition-all active:translate-y-[0px] active:shadow-[2px_2px_0px_0px_rgba(43,24,16,1)] flex items-center gap-2 font-black text-lg"
        >
          <span className="text-2xl">🌰</span>
          <span>ASK GITELLA</span>
        </button>
      )}
    </div>
  );
};