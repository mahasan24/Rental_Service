import path from 'path';
import { fileURLToPath } from 'url';
import vectorStore from './vectorStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.resolve(__dirname, '../../../docs/faq-and-docs');

let initPromise = null;

async function ensureInitialized() {
  if (vectorStore.initialized) return;
  if (!initPromise) {
    initPromise = vectorStore.loadFromDirectory(DOCS_DIR);
  }
  await initPromise;
}

const FOLLOW_UP_MAP = {
  booking: ['How do I cancel a booking?', 'Can I modify my booking dates?', 'How far in advance should I book?'],
  cancel: ['How do I book a van?', 'What if I need to extend my rental?'],
  price: ['Are there extra fees?', 'Do you offer discounts for longer rentals?'],
  fleet: ['What van types do you have?', 'Is fuel included?', 'Are the vans automatic or manual?'],
  account: ['How do I create an account?', 'Can I view my past bookings?'],
  van: ['What van types do you have?', 'How is the price calculated?', 'How do I book a van?'],
};

function getSuggestedFollowUps(question, currentAnswer) {
  const text = (question + ' ' + currentAnswer).toLowerCase();
  for (const [keyword, suggestions] of Object.entries(FOLLOW_UP_MAP)) {
    if (text.includes(keyword)) {
      return suggestions.filter(s => !question.toLowerCase().includes(s.toLowerCase().slice(0, 15)));
    }
  }
  return ['How do I book a van?', 'What van types do you have?', 'How is the price calculated?'];
}

function cleanChunkToAnswer(chunkText) {
  return chunkText
    .replace(/^#+ .+\n?/gm, '')
    .replace(/\*\*/g, '')
    .replace(/^- /gm, '')
    .trim();
}

function synthesizeAnswer(results) {
  if (results.length === 0) return '';

  const topChunk = cleanChunkToAnswer(results[0].text);

  // If top result is strong enough, use it directly
  if (results[0].score > 0.4 || results.length === 1) {
    return topChunk;
  }

  // Combine top 2 results if they are from different sources/topics
  const secondChunk = cleanChunkToAnswer(results[1].text);
  if (results[1].score > 0.15 && results[1].source !== results[0].source) {
    return `${topChunk}\n\nAdditionally: ${secondChunk}`;
  }

  return topChunk;
}

/**
 * RAG-style FAQ answering pipeline:
 * 1. Embed the query via TF-IDF
 * 2. Retrieve top-k relevant chunks from the vector store
 * 3. Synthesize a coherent answer from retrieved context
 * 4. Return answer, sources, confidence, and follow-up suggestions
 *
 * In production, step 3 would use LangChain's RetrievalQAChain + LLM.
 */
export async function answerQuestion(question) {
  await ensureInitialized();

  const results = vectorStore.search(question, 3);

  if (results.length === 0) {
    return {
      answer: "I'm sorry, I couldn't find an answer to that question. Try asking about bookings, pricing, our fleet, or your account.",
      sources: [],
      confidence: 0,
      followUp: ['How do I book a van?', 'What van types do you have?', 'How is the price calculated?'],
    };
  }

  const answer = synthesizeAnswer(results);
  const confidence = Math.round(results[0].score * 100);
  const followUp = getSuggestedFollowUps(question, answer);

  return {
    answer,
    sources: results.map(r => ({
      text: r.text.slice(0, 200),
      source: r.source,
      score: Math.round(r.score * 100),
    })),
    confidence,
    followUp,
  };
}

export async function getStats() {
  await ensureInitialized();
  return vectorStore.getStats();
}

export async function reload() {
  vectorStore.clear();
  initPromise = null;
  await ensureInitialized();
  return vectorStore.getStats();
}
