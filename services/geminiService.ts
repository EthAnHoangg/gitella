import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Commit, ReportData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateReport = async (commits: Commit[], repoName: string): Promise<ReportData> => {
  if (commits.length === 0) {
    throw new Error("No commits found in this time range. Go write some code!");
  }

  // Minimize payload size by extracting only necessary info
  const commitLog = commits.map(c => ({
    msg: c.commit.message,
    author: c.commit.author.name,
    date: c.commit.author.date
  }));

  const prompt = `
    Analyze the following git commit log for the repository "${repoName}".
    
    You are a Gen Z developer advocate/PM assistant. 
    Your goal is to create a "Rizz Report" that summarizes the work done.
    
    Style Guide:
    - Use slightly informal, energetic, "Gen Z" internet slang where appropriate (e.g., "W", "L", "cooked", "based", "no cap").
    - BUT keep the technical details accurate.
    - "vibeScore" should be an integer from 0-100 based on productivity and feature velocity.
    
    Data to analyze:
    ${JSON.stringify(commitLog, null, 2)}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "A punchy, 2-3 sentence summary of the progress." },
          vibeScore: { type: Type.INTEGER, description: "A score from 0 to 100 indicating how productive the period was." },
          highlights: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Top 3 big wins or key moments." 
          },
          features: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            },
            description: "List of new features added."
          },
          fixes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            },
            description: "List of bugs squashed."
          },
          debt: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            },
            description: "Refactoring, chores, or technical debt addressed."
          },
          nextSteps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Inferred suggestions on what to focus on next based on the commits."
          }
        },
        required: ["summary", "vibeScore", "highlights", "features", "fixes", "debt", "nextSteps"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return JSON.parse(text) as ReportData;
};

export const createRepoChat = (commits: Commit[], repoName: string): Chat => {
  // Format commits for context
  const commitLog = commits.map(c => 
    `[${c.sha.substring(0, 7)}] ${c.commit.author.date} - ${c.commit.author.name}: ${c.commit.message}`
  ).join('\n');

  const systemInstruction = `
    You are a specialized AI assistant for the GitHub repository "${repoName}".
    You have access to the following commit history (newest to oldest):
    
    ${commitLog}
    
    Your goal is to answer user questions about what changed, who did what, and technical details based on these commits.
    Style Guide:
    - Keep the tone helpful, slightly technical but accessible (Neubrutalism/Gen Z vibe matches the app, but keep it readable).
    - If a user asks about something not in the log, say you don't have that info.
    - Be concise.
  `;

  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction,
    }
  });
};