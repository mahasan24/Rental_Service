import path from 'path';
import { fileURLToPath } from 'url';
import vectorStore from './vectorStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.resolve(__dirname, '../../../docs/faq-and-docs');

let initPromise = null;

/**
 * Ensure the vector store is loaded with FAQ documents.
 * Uses a singleton promise so initialization happens only once.
 */
async function ensureInitialized() {
  if (vectorStore.initialized) return;
  if (!initPromise) {
    initPromise = vectorStore.loadFromDirectory(DOCS_DIR);
  }
  await initPromise;
}

/**
 * Answer a user's FAQ question using RAG-style retrieval.
 * 1. Embed the query via TF-IDF
 * 2. Search the vector store for relevant chunks
 * 3. Return the best matching chunks as the answer context
 *
 * In production, replace with LangChain's RetrievalQAChain + LLM
 * to generate a natural-language answer from the retrieved chunks.
 */
export async function answerQuestion(question) {
  await ensureInitialized();

  const results = vectorStore.search(question, 3);

  if (results.length === 0) {
    return {
      answer: "I'm sorry, I couldn't find an answer to that question. Please try rephrasing or contact our support team.",
      sources: [],
      confidence: 0,
    };
  }

  // Use the top result as the primary answer
  const topResult = results[0];
  const confidence = Math.round(topResult.score * 100);

  // Extract a clean answer from the chunk text
  const answerText = topResult.text
    .replace(/^#+ .+\n?/gm, '')  // Remove markdown headings
    .trim();

  return {
    answer: answerText,
    sources: results.map(r => ({
      text: r.text.slice(0, 200),
      source: r.source,
      score: Math.round(r.score * 100),
    })),
    confidence,
  };
}

/**
 * Get vector store statistics (chunk count, vocab size, etc.)
 */
export async function getStats() {
  await ensureInitialized();
  return vectorStore.getStats();
}

/**
 * Force reload the vector store (e.g. after updating docs)
 */
export async function reload() {
  vectorStore.clear();
  initPromise = null;
  await ensureInitialized();
  return vectorStore.getStats();
}
