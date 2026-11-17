import { fallbackParse } from './fallback';
import { searchSystemPrompt } from './prompt';
import { parsedQuerySchema, type ParsedQuery } from '@/lib/validators/search';

const queryCache = new Map<string, { parsed: ParsedQuery; usedAI: boolean }>();

function extractJson(text: string) {
  const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('The AI response did not contain JSON.');
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function askModel(input: string): Promise<ParsedQuery | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 800);
  try {
    const provider = process.env.AI_PROVIDER;
    let response: Response;
    if (provider === 'openai' && process.env.OPENAI_API_KEY) {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0,
          response_format: { type: 'json_object' },
          messages: [{ role: 'system', content: searchSystemPrompt }, { role: 'user', content: input }],
        }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error('AI request failed');
      return parsedQuerySchema.parse(extractJson(data.choices?.[0]?.message?.content || ''));
    }
    if (provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-latest',
          max_tokens: 450,
          temperature: 0,
          system: searchSystemPrompt,
          messages: [{ role: 'user', content: input }],
        }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error('AI request failed');
      return parsedQuerySchema.parse(extractJson(data.content?.[0]?.text || ''));
    }
    if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: searchSystemPrompt }] },
            contents: [{ parts: [{ text: input }] }],
            generationConfig: { temperature: 0, responseMimeType: 'application/json' },
          }),
          signal: controller.signal,
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error('AI request failed');
      return parsedQuerySchema.parse(extractJson(data.candidates?.[0]?.content?.parts?.[0]?.text || ''));
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function parseSearch(input: string) {
  const normKey = input.trim().toLowerCase();
  if (queryCache.has(normKey)) {
    return queryCache.get(normKey)!;
  }

  // Fast, intelligent instant parse (<1ms)
  const localParsed = fallbackParse(input);

  // If local parsing confidently identified a service category, return instantly!
  if (localParsed.service !== 'other') {
    const res = { parsed: localParsed, usedAI: false };
    if (queryCache.size > 200) queryCache.clear();
    queryCache.set(normKey, res);
    return res;
  }

  // If unrecognized, optionally try external AI with short timeout (800ms)
  const ai = await askModel(input);
  const finalParsed = ai || localParsed;
  const res = { parsed: finalParsed, usedAI: !!ai };

  if (queryCache.size > 200) queryCache.clear();
  queryCache.set(normKey, res);
  return res;
}
