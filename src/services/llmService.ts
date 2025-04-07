import axios from 'axios';
import Message from '../models/Message';
import dotenv from 'dotenv';
dotenv.config();

export const evaluateJsBlock = (input: string): string => {
  const cleanInput = input.replace(/```(?:javascript)?beginshere/i, 'javascriptbeginshere')
    .replace(/```(?:javascript)?endshere/i, 'javascriptendshere');

  const jsMatch = cleanInput.match(/javascriptbeginshere([\s\S]*?)javascriptendshere/);
  if (!jsMatch) return input;

  let jsBlock = jsMatch[1].trim();

  jsBlock = jsBlock.replace(/\$\{([^}]*)\}/g, (_, expr) => {
    const sanitized = expr.replace(/(\d),(?=\d{3})/g, '$1');
    return `\${${sanitized}}`;
  });

  try {
    const evaluated = Function(`"use strict"; return \`${jsBlock}\`;`)();
    return evaluated;
  } catch (err) {
    console.error('Error evaluating JS block:', err);
    return '[Error evaluating arithmetic in response]';
  }
};

export const callGpt = async (sessionId: string, fullPrompt: string, userInput: string): Promise<string> => {
  const history = await Message.find({ sessionId }).sort({ createdAt: 1 });
  const messages = history.map(m => ({ role: m.role, content: m.content }));
  messages.push({ role: 'user', content: fullPrompt });

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o',
      messages
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const rawReply = response.data.choices[0].message.content;
  const assistantReply = evaluateJsBlock(rawReply);

  await Message.create([
    { sessionId, role: 'user', content: userInput },
    { sessionId, role: 'assistant', content: assistantReply }
  ]);

  return assistantReply;
};

export const callDeepSeek = async (sessionId: string, fullPrompt: string, userInput: string): Promise<string> => {
  const history = await Message.find({ sessionId }).sort({ createdAt: 1 });
  const messages = history.map(m => ({ role: m.role, content: m.content }));
  messages.push({ role: 'user', content: fullPrompt });

  const response = await axios.post('http://localhost:11434/api/chat', {
    model: 'deepseek-r1:1.5b',
    messages,
    stream: false
  });

  let rawReply: string = response.data.message.content;
  rawReply = rawReply.replace(/<think>.*?<\/think>/gis, '').trim();

  const assistantReply = evaluateJsBlock(rawReply);

  await Message.create([
    { sessionId, role: 'user', content: userInput },
    { sessionId, role: 'assistant', content: assistantReply }
  ]);

  return assistantReply;
};


export const callLlm = process.env.LLM_PROVIDER === 'openai' ? callGpt : callDeepSeek;
