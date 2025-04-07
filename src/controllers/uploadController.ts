import { Request, Response } from 'express';
import parsePdf from '../services/pdfParser';
import Insight from '../models/Insight';
import Message from '../models/Message';
import { callLlm } from '../services/llmService';

const jsInstruction = `
Respond using plain natural language, but insert JavaScript \${...} expressions in-line to perform calculations. I suggest using template literals.

Correct example:
"The user's total income is NGN \${120000} and their expenses are NGN \${90000}, so their savings is NGN \${120000 - 90000}."

Do NOT return JavaScript code, objects, or arrays like:
"({ income, expenses, savings })" or "const savings = income - expenses"

Wrap your entire response between:
javascriptbeginshere
... response here
javascriptendshere

Please format numbers using plain digits without commas, e.g., use 20026.88 not 20,026.88.
Do not wrap the response in Markdown code blocks. Only use the plain delimiters:
javascriptbeginshere and javascriptendshere on their own lines.
`;

export const handleUpload = async (req: Request, res: Response) => {
  const sessionId = req.body.sessionId || req.headers['x-session-id'];
  const analysisDepth = req.body.analysisDepth || 'summary';

  if (!sessionId) {
    return res.status(400).json({ error: 'Missing session ID' });
  }

  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'File is missing or invalid' });
    }

    const parsedData = await parsePdf(req.file.buffer);

    if (parsedData.numpages > 13) {
      return res.status(400).json({ error: 'PDF is too long. Max 13 pages allowed.' });
    }

    const basePrompt =
      analysisDepth === 'detailed'
        ? `
You are a financial analyst. Thoroughly examine the user's bank statement. Identify:
- Detailed breakdown of income and expenses
- Spending categories and trends
- High-frequency merchants or recurring patterns
- Unusual outliers or risky behaviors
- Personalized advice for savings, budgeting, or loan repayment.
${jsInstruction}
Here is the statement:
${parsedData.text}`.trim()
        : `
You are a helpful assistant. Briefly summarize this user's bank statement:
- Income vs expenses
- Top 3 spending categories
- One suggestion to save or budget better
${jsInstruction}
Statement:
${parsedData.text}`.trim();

    const gptResponse = await callLlm(sessionId, basePrompt, parsedData.text);

    const newInsight = new Insight({
      sessionId,
      insight: gptResponse
    });

    await newInsight.save();
    res.json({ insight: gptResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId;
  if (!sessionId) return res.status(400).json({ error: 'Missing session ID' });

  const messages = await Message.find({ sessionId }).sort({ createdAt: 1 });
  res.json(messages);
};

export const handleAsk = async (req: Request, res: Response) => {
  const { sessionId, question } = req.body;
  if (!sessionId || !question) return res.status(400).json({ error: 'Missing sessionId or question' });

  try {
    const basePrompt = `
You are a helpful financial assistant. Respond to the user's question using plain natural language.

${jsInstruction}

Question:
${question}
`.trim();

    const gptResponse = await callLlm(sessionId, basePrompt, question);
    res.json({ answer: gptResponse });
  } catch (err) {
    console.error('GPT Ask Error:', err);
    res.status(500).json({ error: 'Failed to get GPT response' });
  }
};
