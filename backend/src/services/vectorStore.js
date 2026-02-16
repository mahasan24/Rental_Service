import fs from 'fs';
import path from 'path';

/**
 * In-memory vector store using TF-IDF embeddings.
 * Mimics LangChain's vector-store pattern for RAG retrieval.
 * Replace with LangChain + OpenAI embeddings for production.
 */

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'it', 'in', 'on', 'at', 'to', 'of', 'for',
  'and', 'or', 'not', 'with', 'this', 'that', 'from', 'by', 'as', 'be',
  'was', 'are', 'were', 'been', 'has', 'have', 'had', 'do', 'does', 'did',
  'will', 'can', 'could', 'would', 'should', 'may', 'might', 'i', 'you',
  'we', 'they', 'he', 'she', 'my', 'your', 'our', 'its', 'me', 'us',
  'if', 'so', 'but', 'no', 'yes', 'what', 'how', 'when', 'where', 'who',
  'which', 'am', 'up', 'out', 'about', 'also', 'just', 'all', 'more',
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

function chunkMarkdown(text, maxChunkSize = 500) {
  const sections = text.split(/\n## /);
  const chunks = [];

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    // Split by Q&A pairs (lines starting with "- **")
    const qaPairs = trimmed.split(/\n- \*\*/);
    if (qaPairs.length > 1) {
      const sectionTitle = qaPairs[0].trim();
      for (let i = 1; i < qaPairs.length; i++) {
        const chunk = `${sectionTitle}\n- **${qaPairs[i].trim()}`;
        chunks.push(chunk);
      }
    } else if (trimmed.length <= maxChunkSize) {
      chunks.push(trimmed);
    } else {
      // Split long sections by paragraphs
      const paragraphs = trimmed.split(/\n\n+/);
      let current = '';
      for (const para of paragraphs) {
        if ((current + '\n\n' + para).length > maxChunkSize && current) {
          chunks.push(current.trim());
          current = para;
        } else {
          current = current ? current + '\n\n' + para : para;
        }
      }
      if (current.trim()) chunks.push(current.trim());
    }
  }
  return chunks;
}

class InMemoryVectorStore {
  constructor() {
    this.documents = [];     // { id, text, tokens, source }
    this.idfCache = {};      // term -> IDF value
    this.initialized = false;
  }

  /** Load and embed all markdown docs from a directory */
  async loadFromDirectory(dirPath) {
    const resolvedDir = path.resolve(dirPath);
    if (!fs.existsSync(resolvedDir)) {
      console.warn(`[VectorStore] Directory not found: ${resolvedDir}`);
      return;
    }

    const files = fs.readdirSync(resolvedDir).filter(f => f.endsWith('.md'));
    let docId = 0;

    for (const file of files) {
      const content = fs.readFileSync(path.join(resolvedDir, file), 'utf-8');
      const chunks = chunkMarkdown(content);

      for (const chunk of chunks) {
        this.documents.push({
          id: docId++,
          text: chunk,
          tokens: tokenize(chunk),
          source: file,
        });
      }
    }

    this._buildIdf();
    this.initialized = true;
    console.log(`[VectorStore] Loaded ${this.documents.length} chunks from ${files.length} files`);
  }

  /** Build IDF (inverse document frequency) values */
  _buildIdf() {
    const docCount = this.documents.length;
    const termDocFreq = {};

    for (const doc of this.documents) {
      const uniqueTerms = new Set(doc.tokens);
      for (const term of uniqueTerms) {
        termDocFreq[term] = (termDocFreq[term] || 0) + 1;
      }
    }

    this.idfCache = {};
    for (const [term, freq] of Object.entries(termDocFreq)) {
      this.idfCache[term] = Math.log((docCount + 1) / (freq + 1)) + 1;
    }
  }

  /** Compute TF-IDF vector for a token list */
  _tfidf(tokens) {
    const tf = {};
    for (const t of tokens) {
      tf[t] = (tf[t] || 0) + 1;
    }
    const maxTf = Math.max(...Object.values(tf), 1);
    const vector = {};
    for (const [term, count] of Object.entries(tf)) {
      const normalizedTf = count / maxTf;
      const idf = this.idfCache[term] || 1;
      vector[term] = normalizedTf * idf;
    }
    return vector;
  }

  /** Cosine similarity between two sparse vectors */
  _cosineSimilarity(vecA, vecB) {
    let dot = 0, normA = 0, normB = 0;
    for (const key of Object.keys(vecA)) {
      if (vecB[key]) dot += vecA[key] * vecB[key];
      normA += vecA[key] ** 2;
    }
    for (const val of Object.values(vecB)) {
      normB += val ** 2;
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }

  /**
   * Search for the most relevant chunks given a query string.
   * Returns top-k results with similarity scores.
   */
  search(query, topK = 3) {
    if (!this.initialized || this.documents.length === 0) {
      return [];
    }

    const queryTokens = tokenize(query);
    const queryVec = this._tfidf(queryTokens);

    const scored = this.documents.map(doc => {
      const docVec = this._tfidf(doc.tokens);
      const score = this._cosineSimilarity(queryVec, docVec);
      return { ...doc, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).filter(r => r.score > 0.05);
  }

  /** Get store stats */
  getStats() {
    return {
      initialized: this.initialized,
      documentCount: this.documents.length,
      vocabularySize: Object.keys(this.idfCache).length,
    };
  }

  /** Clear and reinitialize */
  clear() {
    this.documents = [];
    this.idfCache = {};
    this.initialized = false;
  }
}

// Singleton instance
const vectorStore = new InMemoryVectorStore();

export default vectorStore;
export { chunkMarkdown, tokenize, InMemoryVectorStore };
