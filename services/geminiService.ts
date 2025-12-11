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
    
    You are a Staff Software Engineer and Technical Lead. 
    Your goal is to create a comprehensive, technical retrospective report.
    
    Style Guide:
    - **Summary & Lists**: Use strictly professional, technical, and data-driven language. Focus on architectural changes, performance improvements, and business value.
    - **Productivity Score**: An integer (0-100) based on code velocity, complexity, impact, and consistency.
    - **Strategic Recommendations**: Provide high-level, actionable advice for the engineering team. Focus on process improvements, architectural scalability, reducing technical debt, or improving testing coverage based on the patterns you see in the commits.
    
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
          summary: { type: Type.STRING, description: "A professional, technical executive summary of the progress and engineering impact." },
          productivityScore: { type: Type.INTEGER, description: "A score from 0 to 100 indicating technical productivity." },
          highlights: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Top 3 technical achievements or architectural milestones."
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
            description: "List of new features implemented, described technically."
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
            description: "List of bugs resolved, including technical root causes if implied."
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
            description: "Refactoring, maintenance, dependencies, or technical debt addressed."
          },
          recommendations: {
            type: Type.STRING,
            description: "Actionable strategic advice for the engineering team."
          }
        },
        required: ["summary", "productivityScore", "highlights", "features", "fixes", "debt", "recommendations"]
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
    You are an expert Technical Assistant for the GitHub repository "${repoName}".
    You have access to the following commit history (newest to oldest):
    
    ${commitLog}
    
    Your goal is to answer user questions about what changed, who did what, and technical details based on these commits.
    You also have access to Google Search to find real-time information if needed (e.g. documentation, recent issues, library versions).
    
    Style Guide:
    - **Tone**: Professional, precise, and helpful. Act like a Senior Engineer explaining the codebase.
    - **Accuracy**: Be factually accurate based on the commit logs. If a user asks about something not in the log, state that you don't have that info or use Google Search if relevant.
    - **Formatting**: Use Markdown. ALWAYS use code blocks (\`\`\`) for code snippets, logs, or file paths. Use bold (**text**) for emphasis. Use lists for bullet points.
  `;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }]
    }
  });
};