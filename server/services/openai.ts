import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface CodeExplanation {
  lineRanges: Array<{
    start: number;
    end: number;
    title: string;
    explanation: string;
  }>;
}

export interface CodeIssue {
  line: number;
  severity: "error" | "warning" | "info";
  type: string;
  description: string;
  suggestion: string;
}

export interface CodeAnalysisResult {
  explanation: CodeExplanation;
  issues: CodeIssue[];
}

export async function analyzeCode(code: string, filename?: string): Promise<CodeAnalysisResult> {
  try {
    const prompt = `Analyze the following Python code and provide a comprehensive analysis in JSON format.

Code to analyze:
\`\`\`python
${code}
\`\`\`

Please provide your analysis in the following JSON structure:
{
  "explanation": {
    "lineRanges": [
      {
        "start": 1,
        "end": 3,
        "title": "Brief title describing this code section",
        "explanation": "Detailed explanation of what this code does in plain English"
      }
    ]
  },
  "issues": [
    {
      "line": 5,
      "severity": "error|warning|info",
      "type": "Bug Type (e.g., Potential Bug, Performance, Security)",
      "description": "Description of the issue",
      "suggestion": "Suggested fix or improvement"
    }
  ]
}

Focus on:
1. Breaking down the code into logical sections with line-by-line explanations
2. Identifying potential bugs, security issues, performance problems
3. Suggesting improvements and best practices
4. Using clear, beginner-friendly language for explanations`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert Python code reviewer and teacher. Provide thorough, educational analysis of code with clear explanations and actionable suggestions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as CodeAnalysisResult;
  } catch (error) {
    throw new Error(`Failed to analyze code: ${error.message}`);
  }
}

export async function answerCodeQuestion(code: string, question: string, context?: string): Promise<string> {
  try {
    const prompt = `Given the following Python code, please answer the user's question in a clear and helpful way.

Code:
\`\`\`python
${code}
\`\`\`

${context ? `Previous context: ${context}` : ''}

User's question: ${question}

Please provide a clear, educational answer that helps the user understand the code better.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful Python programming teacher. Answer questions about code clearly and educationally, providing examples when helpful."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response to your question.";
  } catch (error) {
    throw new Error(`Failed to answer question: ${error.message}`);
  }
}
