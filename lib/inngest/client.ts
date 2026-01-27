import { Inngest } from 'inngest'

// Create Inngest client
export const inngest = new Inngest({
  id: 'shipped-fyi',
  eventKey: process.env.INNGEST_EVENT_KEY
})

// Event types for type safety
export interface FeedbackEvents {
  'message/received': {
    data: {
      rawMessageId: string
      projectId: string
      integrationSourceId: string
    }
  }
  'message/process': {
    data: {
      rawMessageId: string
      projectId: string
    }
  }
  'feedback/cluster': {
    data: {
      extractedFeedbackId: string
      projectId: string
    }
  }
  'integration/sync': {
    data: {
      integrationSourceId: string
      projectId: string
      fullSync?: boolean
    }
  }
  'integration/sync.slack': {
    data: {
      integrationSourceId: string
      projectId: string
      channelId: string
      cursor?: string
    }
  }
  'appstore/poll': {
    data: {
      integrationSourceId: string
      projectId: string
      appId: string
    }
  }
  'clusters/recompute': {
    data: {
      projectId: string
    }
  }
}

// Re-export for convenience
export type { EventSchemas } from 'inngest'
