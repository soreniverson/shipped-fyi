// Prompt templates for AI feedback extraction

export const FEEDBACK_EXTRACTION_SYSTEM_PROMPT = `You are an AI assistant specialized in analyzing customer communications to extract actionable product feedback. You identify feature requests, bug reports, complaints, praise, and questions from raw customer messages.

Your extraction should be:
- Precise: Only extract genuine product feedback, not general conversation
- Actionable: Summarize feedback in a way that helps product teams act on it
- Contextual: Preserve enough context to understand the customer's situation
- Honest: Set confidence scores accurately based on clarity of the feedback

Output valid JSON only, with no additional text.`

export interface ExtractedFeedbackItem {
  type: 'feature_request' | 'bug_report' | 'complaint' | 'praise' | 'question'
  title: string
  description: string
  quote: string
  confidence: number
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
  urgency: 'low' | 'normal' | 'high' | 'critical'
}

export interface ExtractionResult {
  has_feedback: boolean
  feedback_items: ExtractedFeedbackItem[]
  skip_reason?: string
}

export function buildExtractionPrompt(
  message: string,
  context?: {
    source?: string
    channel?: string
    user_name?: string
    previous_messages?: string[]
  }
): string {
  const contextParts: string[] = []

  if (context?.source) {
    contextParts.push(`Source: ${context.source}`)
  }
  if (context?.channel) {
    contextParts.push(`Channel: ${context.channel}`)
  }
  if (context?.user_name) {
    contextParts.push(`From: ${context.user_name}`)
  }
  if (context?.previous_messages && context.previous_messages.length > 0) {
    contextParts.push(`Previous context:\n${context.previous_messages.join('\n')}`)
  }

  const contextStr = contextParts.length > 0
    ? `Context:\n${contextParts.join('\n')}\n\n`
    : ''

  return `${contextStr}Analyze the following customer message and extract any product feedback.

Message:
"""
${message}
"""

Instructions:
1. Identify if this message contains actionable product feedback
2. If yes, extract each feedback item with:
   - type: feature_request | bug_report | complaint | praise | question
   - title: A concise, actionable summary (max 80 chars)
   - description: Detailed context including what the user wants and why
   - quote: The most relevant verbatim text from the message
   - confidence: 0.0-1.0 how confident you are this is genuine product feedback
   - sentiment: positive | negative | neutral | mixed
   - urgency: low | normal | high | critical (based on language intensity and business impact)

3. Set has_feedback to false and provide skip_reason if:
   - Message is just casual conversation
   - Message is unclear or ambiguous
   - Message is spam or off-topic
   - Message is just a greeting or thank you

Return JSON in this exact format:
{
  "has_feedback": boolean,
  "feedback_items": [
    {
      "type": "feature_request",
      "title": "Add dark mode support",
      "description": "User wants dark mode to reduce eye strain during night usage",
      "quote": "Would love if you guys added dark mode, I use this app late at night",
      "confidence": 0.95,
      "sentiment": "neutral",
      "urgency": "normal"
    }
  ],
  "skip_reason": "optional - why no feedback was extracted"
}`
}

// Keywords that suggest a message might contain feedback (for pre-filtering)
export const FEEDBACK_KEYWORDS = [
  // Feature requests
  'feature', 'request', 'wish', 'would be nice', 'would love', 'could you add',
  'can you add', 'please add', 'need', 'want', 'missing', 'should have',
  'it would be great', 'idea', 'suggestion', 'propose',

  // Bug reports
  'bug', 'broken', 'doesn\'t work', 'not working', 'error', 'crash', 'issue',
  'problem', 'fail', 'wrong', 'incorrect', 'stuck', 'freeze', 'slow',

  // Complaints
  'frustrated', 'annoyed', 'disappointed', 'hate', 'terrible', 'awful',
  'useless', 'waste', 'can\'t believe', 'ridiculous', 'unacceptable',

  // Praise (still valuable feedback)
  'love', 'amazing', 'great', 'awesome', 'fantastic', 'helpful', 'thank you',
  'best', 'perfect', 'exactly what I needed', 'game changer',

  // Questions that imply features
  'how do I', 'is there a way', 'can I', 'is it possible', 'does it support'
]

export function mightContainFeedback(text: string): boolean {
  const lowercaseText = text.toLowerCase()
  return FEEDBACK_KEYWORDS.some(keyword => lowercaseText.includes(keyword))
}
