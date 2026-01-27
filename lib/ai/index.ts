import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import {
  FEEDBACK_EXTRACTION_SYSTEM_PROMPT,
  buildExtractionPrompt,
  ExtractionResult,
  ExtractedFeedbackItem,
  mightContainFeedback
} from './extraction-prompt'

// Lazy-initialized clients to avoid errors during build
let anthropic: Anthropic | null = null
let openai: OpenAI | null = null

function getAnthropicClient(): Anthropic {
  if (!anthropic) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })
  }
  return anthropic
}

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }
  return openai
}

// Model configurations
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'
const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIMENSIONS = 1536

// Cost per token (in cents) - approximate as of 2025
const CLAUDE_COSTS = {
  input: 0.0003, // $3 per 1M tokens
  output: 0.0015 // $15 per 1M tokens
}

const EMBEDDING_COST_PER_TOKEN = 0.00002 // $0.02 per 1M tokens

export interface ProcessingResult {
  success: boolean
  feedbackItems: ExtractedFeedbackItem[]
  usage: {
    inputTokens: number
    outputTokens: number
    costCents: number
  }
  latencyMs: number
  error?: string
}

export interface EmbeddingResult {
  success: boolean
  embedding: number[] | null
  usage: {
    tokens: number
    costCents: number
  }
  latencyMs: number
  error?: string
}

/**
 * Pre-filter messages to avoid unnecessary AI calls
 */
export function shouldProcess(text: string): boolean {
  // Skip very short messages
  if (text.trim().length < 10) return false

  // Skip very long messages (likely not relevant feedback)
  if (text.length > 10000) return false

  // Check for feedback keywords
  return mightContainFeedback(text)
}

/**
 * Extract feedback from a customer message using Claude
 */
export async function extractFeedback(
  message: string,
  context?: {
    source?: string
    channel?: string
    user_name?: string
    previous_messages?: string[]
  }
): Promise<ProcessingResult> {
  const startTime = Date.now()

  try {
    const prompt = buildExtractionPrompt(message, context)

    const response = await getAnthropicClient().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      system: FEEDBACK_EXTRACTION_SYSTEM_PROMPT
    })

    const latencyMs = Date.now() - startTime

    // Extract usage info
    const inputTokens = response.usage.input_tokens
    const outputTokens = response.usage.output_tokens
    const costCents = (inputTokens * CLAUDE_COSTS.input) + (outputTokens * CLAUDE_COSTS.output)

    // Parse the response
    const content = response.content[0]
    if (content.type !== 'text') {
      return {
        success: false,
        feedbackItems: [],
        usage: { inputTokens, outputTokens, costCents },
        latencyMs,
        error: 'Unexpected response type from Claude'
      }
    }

    // Parse JSON from response
    let result: ExtractionResult
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      result = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      return {
        success: false,
        feedbackItems: [],
        usage: { inputTokens, outputTokens, costCents },
        latencyMs,
        error: `Failed to parse Claude response: ${parseError}`
      }
    }

    // Return extracted feedback
    return {
      success: true,
      feedbackItems: result.has_feedback ? result.feedback_items : [],
      usage: { inputTokens, outputTokens, costCents },
      latencyMs
    }
  } catch (error) {
    return {
      success: false,
      feedbackItems: [],
      usage: { inputTokens: 0, outputTokens: 0, costCents: 0 },
      latencyMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Generate embedding for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  const startTime = Date.now()

  try {
    // Truncate text if too long (embedding model has token limits)
    const truncatedText = text.slice(0, 8000)

    const response = await getOpenAIClient().embeddings.create({
      model: EMBEDDING_MODEL,
      input: truncatedText,
      dimensions: EMBEDDING_DIMENSIONS
    })

    const latencyMs = Date.now() - startTime
    const tokens = response.usage.total_tokens
    const costCents = tokens * EMBEDDING_COST_PER_TOKEN

    return {
      success: true,
      embedding: response.data[0].embedding,
      usage: { tokens, costCents },
      latencyMs
    }
  } catch (error) {
    return {
      success: false,
      embedding: null,
      usage: { tokens: 0, costCents: 0 },
      latencyMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Generate embedding for feedback (combines title and description)
 */
export async function generateFeedbackEmbedding(
  title: string,
  description?: string
): Promise<EmbeddingResult> {
  const text = description ? `${title}\n\n${description}` : title
  return generateEmbedding(text)
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have the same dimensions')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Calculate centroid of multiple embeddings
 */
export function calculateCentroid(embeddings: number[][]): number[] {
  if (embeddings.length === 0) {
    throw new Error('Cannot calculate centroid of empty array')
  }

  const dimensions = embeddings[0].length
  const centroid = new Array(dimensions).fill(0)

  for (const embedding of embeddings) {
    for (let i = 0; i < dimensions; i++) {
      centroid[i] += embedding[i]
    }
  }

  // Normalize
  const count = embeddings.length
  for (let i = 0; i < dimensions; i++) {
    centroid[i] /= count
  }

  return centroid
}

/**
 * Update cluster centroid with a new member
 */
export function updateCentroid(
  currentCentroid: number[],
  newEmbedding: number[],
  currentCount: number
): number[] {
  const newCount = currentCount + 1
  return currentCentroid.map((val, i) =>
    (val * currentCount + newEmbedding[i]) / newCount
  )
}

export { type ExtractedFeedbackItem, type ExtractionResult }
