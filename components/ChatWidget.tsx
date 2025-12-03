import React, { useState, useRef, useEffect } from 'react';
import { Chat } from '@google/genai';
import { Commit, ChatMessage } from '../types';
import { createRepoChat } from '../services/geminiService';

interface ChatWidgetProps {
  commits: Commit[];
  repoName: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ commits, repoName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'model', text: `Yo! I read ${commits.length} commits for ${repoName}. Ask me anything about the code.` }
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
      
      const aiMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: responseText 
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
        <div className="pointer-events-auto mb-4 w-80 md:w-96 bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col animate-[fadeIn_0.2s_ease-out]">
          {/* Header */}
          <div className="bg-[#B8FF9F] border-b-2 border-black p-3 flex justify-between items-center">
            <h3 className="font-bold uppercase text-sm flex items-center gap-2 text-black">
              <span>🤖</span> GitRizz Chat
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-black hover:text-white px-2 font-bold transition-colors text-black border-2 border-transparent hover:border-white"
            >
              X
            </button>
          </div>
          
          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 flex flex-col gap-3 bg-[#f9f9f9] custom-scrollbar">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`max-w-[85%] p-3 border-2 border-black text-sm font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                  msg.role === 'user' 
                    ? 'self-end bg-[#A0C4FF] text-black' 
                    : 'self-start bg-white text-black'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="self-start bg-gray-100 p-2 border-2 border-black text-xs font-bold animate-pulse text-black">
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t-2 border-black bg-white flex gap-2">
            <input
              className="flex-grow border-2 border-black p-2 text-sm font-bold focus:outline-none focus:bg-yellow-50 placeholder:text-gray-400 text-black"
              placeholder="Ask about features..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-black text-white px-3 font-bold hover:bg-gray-800 disabled:opacity-50 border-2 border-black"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto bg-[#B8FF9F] text-black border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-[0px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 font-bold text-lg"
      >
        <span className="text-2xl">💬</span>
        {!isOpen && <span>ASK AI</span>}
      </button>
    </div>
  );
};
