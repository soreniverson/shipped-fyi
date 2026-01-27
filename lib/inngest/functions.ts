import { inngest } from './client'
import { createClient } from '@supabase/supabase-js'
import {
  extractFeedback,
  generateFeedbackEmbedding,
  shouldProcess,
  updateCentroid
} from '@/lib/ai'

// Use service role client for background jobs (typed as any to handle new tables)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getServiceClient(): any {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const CLUSTER_SIMILARITY_THRESHOLD = 0.85

/**
 * Process a raw message - extract feedback using AI
 */
export const processMessage = inngest.createFunction(
  {
    id: 'process-message',
    retries: 3,
    throttle: {
      limit: 10,
      period: '1m'
    }
  },
  { event: 'message/process' },
  async ({ event, step }) => {
    const { rawMessageId, projectId } = event.data
    const supabase = getServiceClient()

    // Get the raw message
    const { data: rawMessage, error: fetchError } = await step.run(
      'fetch-raw-message',
      async () => {
        const result = await supabase
          .from('raw_messages')
          .select('*, integration_sources(*)')
          .eq('id', rawMessageId)
          .single()
        return result
      }
    )

    if (fetchError || !rawMessage) {
      throw new Error(`Failed to fetch raw message: ${fetchError?.message}`)
    }

    // Mark as processing
    await step.run('mark-processing', async () => {
      await supabase
        .from('raw_messages')
        .update({ status: 'processing' })
        .eq('id', rawMessageId)
    })

    // Check if we should process this message
    if (!shouldProcess(rawMessage.content)) {
      await step.run('mark-skipped', async () => {
        await supabase
          .from('raw_messages')
          .update({
            status: 'skipped',
            processed_at: new Date().toISOString()
          })
          .eq('id', rawMessageId)
      })
      return { skipped: true, reason: 'No relevant keywords detected' }
    }

    // Extract feedback using AI
    const extractionResult = await step.run('extract-feedback', async () => {
      const source = rawMessage.integration_sources as { type: string; name: string } | null
      return extractFeedback(rawMessage.content, {
        source: source?.name,
        channel: rawMessage.channel_name || undefined,
        user_name: rawMessage.external_user_name || undefined
      })
    })

    // Log AI usage
    await step.run('log-ai-usage', async () => {
      await supabase.from('ai_processing_logs').insert({
        project_id: projectId,
        operation: 'extract_feedback',
        model: 'claude-sonnet-4-20250514',
        input_tokens: extractionResult.usage.inputTokens,
        output_tokens: extractionResult.usage.outputTokens,
        cost_cents: extractionResult.usage.costCents,
        raw_message_id: rawMessageId,
        success: extractionResult.success,
        error_message: extractionResult.error,
        latency_ms: extractionResult.latencyMs
      })
    })

    if (!extractionResult.success) {
      await step.run('mark-error', async () => {
        await supabase
          .from('raw_messages')
          .update({
            status: 'error',
            error_message: extractionResult.error,
            processed_at: new Date().toISOString()
          })
          .eq('id', rawMessageId)
      })
      throw new Error(`Extraction failed: ${extractionResult.error}`)
    }

    // If no feedback was extracted, mark as processed and return
    if (extractionResult.feedbackItems.length === 0) {
      await step.run('mark-processed-no-feedback', async () => {
        await supabase
          .from('raw_messages')
          .update({
            status: 'processed',
            processed_at: new Date().toISOString()
          })
          .eq('id', rawMessageId)
      })
      return { extracted: 0 }
    }

    // Process each feedback item
    const feedbackIds: string[] = []

    for (let i = 0; i < extractionResult.feedbackItems.length; i++) {
      const item = extractionResult.feedbackItems[i]

      // Generate embedding
      const embeddingResult = await step.run(
        `generate-embedding-${i}`,
        async () => generateFeedbackEmbedding(item.title, item.description)
      )

      // Log embedding usage
      if (embeddingResult.success) {
        await step.run(`log-embedding-usage-${i}`, async () => {
          await supabase.from('ai_processing_logs').insert({
            project_id: projectId,
            operation: 'generate_embedding',
            model: 'text-embedding-3-small',
            input_tokens: embeddingResult.usage.tokens,
            output_tokens: 0,
            cost_cents: embeddingResult.usage.costCents,
            raw_message_id: rawMessageId,
            success: true,
            latency_ms: embeddingResult.latencyMs
          })
        })
      }

      // Insert extracted feedback
      const { data: feedback, error: insertError } = await step.run(
        `insert-feedback-${i}`,
        async () => {
          return supabase
            .from('extracted_feedback')
            .insert({
              raw_message_id: rawMessageId,
              project_id: projectId,
              type: item.type,
              title: item.title,
              description: item.description,
              quote: item.quote,
              confidence: item.confidence,
              sentiment: item.sentiment,
              urgency: item.urgency,
              embedding: embeddingResult.embedding,
              customer_name: rawMessage.external_user_name,
              customer_email: rawMessage.external_user_email
            })
            .select()
            .single()
        }
      )

      if (insertError) {
        console.error('Failed to insert feedback:', insertError)
        continue
      }

      feedbackIds.push(feedback.id)

      // Trigger clustering
      await step.sendEvent('trigger-clustering', {
        name: 'feedback/cluster',
        data: {
          extractedFeedbackId: feedback.id,
          projectId
        }
      })
    }

    // Mark raw message as processed
    await step.run('mark-processed', async () => {
      await supabase
        .from('raw_messages')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString()
        })
        .eq('id', rawMessageId)
    })

    return { extracted: feedbackIds.length, feedbackIds }
  }
)

/**
 * Cluster feedback - find similar feedback and group together
 */
export const clusterFeedback = inngest.createFunction(
  {
    id: 'cluster-feedback',
    retries: 2,
    throttle: {
      limit: 20,
      period: '1m'
    }
  },
  { event: 'feedback/cluster' },
  async ({ event, step }) => {
    const { extractedFeedbackId, projectId } = event.data
    const supabase = getServiceClient()

    // Get the feedback with embedding
    const { data: feedback, error } = await step.run('fetch-feedback', async () => {
      return supabase
        .from('extracted_feedback')
        .select('*')
        .eq('id', extractedFeedbackId)
        .single()
    })

    if (error || !feedback || !feedback.embedding) {
      return { clustered: false, reason: 'No embedding available' }
    }

    // Find similar existing clusters
    const { data: similarClusters } = await step.run('find-similar-clusters', async () => {
      return supabase.rpc('find_similar_clusters', {
        p_embedding: feedback.embedding,
        p_project_id: projectId,
        p_threshold: CLUSTER_SIMILARITY_THRESHOLD,
        p_limit: 5
      })
    })

    if (similarClusters && similarClusters.length > 0) {
      // Add to the most similar cluster
      const bestMatch = similarClusters[0]

      // Get current cluster
      const { data: cluster } = await step.run('get-cluster', async () => {
        return supabase
          .from('feedback_clusters')
          .select('*')
          .eq('id', bestMatch.cluster_id)
          .single()
      })

      if (cluster) {
        // Update feedback with cluster assignment
        await step.run('assign-to-cluster', async () => {
          await supabase
            .from('extracted_feedback')
            .update({ cluster_id: bestMatch.cluster_id })
            .eq('id', extractedFeedbackId)
        })

        // Update cluster centroid
        if (cluster.centroid_embedding) {
          const newCentroid = updateCentroid(
            cluster.centroid_embedding,
            feedback.embedding as number[],
            cluster.member_count
          )

          await step.run('update-cluster-centroid', async () => {
            await supabase
              .from('feedback_clusters')
              .update({
                centroid_embedding: newCentroid,
                total_mentions: cluster.total_mentions + 1
              })
              .eq('id', bestMatch.cluster_id)
          })
        }

        return { clustered: true, clusterId: bestMatch.cluster_id, similarity: bestMatch.similarity }
      }
    }

    // Also check similarity to existing items in the roadmap
    const { data: existingItems } = await step.run('find-similar-items', async () => {
      return supabase
        .from('items')
        .select('id, title, description')
        .eq('project_id', projectId)
        .limit(100)
    })

    // For now, we'll create a new cluster if no match found
    // (In future, could use embeddings on existing items too)
    if (feedback.confidence >= 0.7) {
      const { data: newCluster } = await step.run('create-cluster', async () => {
        return supabase
          .from('feedback_clusters')
          .insert({
            project_id: projectId,
            title: feedback.title,
            description: feedback.description,
            centroid_embedding: feedback.embedding,
            member_count: 1,
            total_mentions: 1
          })
          .select()
          .single()
      })

      if (newCluster) {
        await step.run('assign-to-new-cluster', async () => {
          await supabase
            .from('extracted_feedback')
            .update({ cluster_id: newCluster.id })
            .eq('id', extractedFeedbackId)
        })

        return { clustered: true, clusterId: newCluster.id, newCluster: true }
      }
    }

    return { clustered: false, reason: 'Low confidence, left unclustered' }
  }
)

/**
 * Handle incoming message from integration - queue for processing
 */
export const handleMessageReceived = inngest.createFunction(
  {
    id: 'handle-message-received',
    retries: 2
  },
  { event: 'message/received' },
  async ({ event, step }) => {
    // Simply forward to the processing function
    await step.sendEvent('queue-processing', {
      name: 'message/process',
      data: {
        rawMessageId: event.data.rawMessageId,
        projectId: event.data.projectId
      }
    })

    return { queued: true }
  }
)

/**
 * Sync Slack channel history
 */
export const syncSlackChannel = inngest.createFunction(
  {
    id: 'sync-slack-channel',
    retries: 3,
    throttle: {
      limit: 5,
      period: '1m'
    }
  },
  { event: 'integration/sync.slack' },
  async ({ event, step }) => {
    const { integrationSourceId, projectId, channelId, cursor } = event.data
    const supabase = getServiceClient()

    // Get integration with tokens
    const { data: integration, error } = await step.run('get-integration', async () => {
      return supabase
        .from('integration_sources')
        .select('*')
        .eq('id', integrationSourceId)
        .single()
    })

    if (error || !integration || !integration.access_token) {
      throw new Error('Integration not found or missing access token')
    }

    // Fetch messages from Slack
    const slackResponse = await step.run('fetch-slack-messages', async () => {
      const params = new URLSearchParams({
        channel: channelId,
        limit: '100'
      })

      if (cursor) {
        params.set('cursor', cursor)
      }

      const response = await fetch(
        `https://slack.com/api/conversations.history?${params}`,
        {
          headers: {
            Authorization: `Bearer ${integration.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.json()
    })

    if (!slackResponse.ok) {
      await step.run('update-integration-error', async () => {
        await supabase
          .from('integration_sources')
          .update({
            last_error: slackResponse.error,
            status: slackResponse.error === 'token_expired' ? 'error' : 'active'
          })
          .eq('id', integrationSourceId)
      })
      throw new Error(`Slack API error: ${slackResponse.error}`)
    }

    // Process each message
    let insertedCount = 0
    for (const message of slackResponse.messages || []) {
      // Skip bot messages and system messages
      if (message.subtype || message.bot_id) continue

      // Insert raw message (upsert to handle duplicates)
      const { error: insertError } = await step.run(
        `insert-message-${message.ts}`,
        async () => {
          return supabase.from('raw_messages').upsert(
            {
              integration_source_id: integrationSourceId,
              project_id: projectId,
              external_id: message.ts,
              external_thread_id: message.thread_ts,
              external_user_id: message.user,
              content: message.text,
              channel_name: channelId,
              message_timestamp: new Date(parseFloat(message.ts) * 1000).toISOString(),
              metadata: {
                reactions: message.reactions,
                reply_count: message.reply_count
              }
            },
            {
              onConflict: 'integration_source_id,external_id',
              ignoreDuplicates: true
            }
          )
        }
      )

      if (!insertError) {
        insertedCount++
      }
    }

    // Update last sync time
    await step.run('update-last-sync', async () => {
      await supabase
        .from('integration_sources')
        .update({
          last_sync_at: new Date().toISOString(),
          last_error: null
        })
        .eq('id', integrationSourceId)
    })

    // If there are more messages, continue pagination
    if (slackResponse.has_more && slackResponse.response_metadata?.next_cursor) {
      await step.sendEvent('continue-sync', {
        name: 'integration/sync.slack',
        data: {
          integrationSourceId,
          projectId,
          channelId,
          cursor: slackResponse.response_metadata.next_cursor
        }
      })
    }

    // Trigger processing for new messages
    const { data: pendingMessages } = await step.run('get-pending-messages', async () => {
      return supabase
        .from('raw_messages')
        .select('id')
        .eq('integration_source_id', integrationSourceId)
        .eq('status', 'pending')
        .limit(50)
    })

    if (pendingMessages) {
      for (const msg of pendingMessages) {
        await step.sendEvent(`process-${msg.id}`, {
          name: 'message/process',
          data: {
            rawMessageId: msg.id,
            projectId
          }
        })
      }
    }

    return {
      inserted: insertedCount,
      hasMore: slackResponse.has_more,
      pendingProcessing: pendingMessages?.length || 0
    }
  }
)

/**
 * Poll App Store reviews (cron job)
 */
export const pollAppStoreReviews = inngest.createFunction(
  {
    id: 'poll-appstore-reviews',
    retries: 2
  },
  { cron: '0 * * * *' }, // Every hour
  async ({ step }) => {
    const supabase = getServiceClient()

    // Get all active App Store integrations
    const { data: integrations } = await step.run('get-appstore-integrations', async () => {
      return supabase
        .from('integration_sources')
        .select('*')
        .eq('type', 'app_store')
        .eq('status', 'active')
    })

    if (!integrations || integrations.length === 0) {
      return { message: 'No active App Store integrations' }
    }

    // Trigger poll for each integration
    for (const integration of integrations) {
      const config = integration.config as { app_id?: string }
      if (!config?.app_id) continue

      await step.sendEvent(`poll-${integration.id}`, {
        name: 'appstore/poll',
        data: {
          integrationSourceId: integration.id,
          projectId: integration.project_id,
          appId: config.app_id
        }
      })
    }

    return { triggered: integrations.length }
  }
)

/**
 * Fetch and process App Store reviews
 */
export const fetchAppStoreReviews = inngest.createFunction(
  {
    id: 'fetch-appstore-reviews',
    retries: 3
  },
  { event: 'appstore/poll' },
  async ({ event, step }) => {
    const { integrationSourceId, projectId, appId } = event.data
    const supabase = getServiceClient()

    // Fetch RSS feed
    const feedResponse = await step.run('fetch-rss-feed', async () => {
      const response = await fetch(
        `https://itunes.apple.com/rss/customerreviews/id=${appId}/sortBy=mostRecent/xml`
      )
      return response.text()
    })

    // Parse XML (basic parsing - in production use a proper XML parser)
    const reviews: Array<{
      id: string
      author: string
      title: string
      content: string
      rating: number
      date: string
    }> = []

    // Extract entries using regex (simplified for demo)
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
    let match

    while ((match = entryRegex.exec(feedResponse)) !== null) {
      const entry = match[1]

      const id = entry.match(/<id>(.*?)<\/id>/)?.[1]
      const author = entry.match(/<author>[\s\S]*?<name>(.*?)<\/name>/)?.[1]
      const title = entry.match(/<title>(.*?)<\/title>/)?.[1]
      const content = entry.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1]
      const rating = entry.match(/<im:rating>(.*?)<\/im:rating>/)?.[1]
      const date = entry.match(/<updated>(.*?)<\/updated>/)?.[1]

      if (id && content) {
        reviews.push({
          id,
          author: author || 'Anonymous',
          title: title || '',
          content: content.replace(/<[^>]*>/g, ''), // Strip HTML
          rating: parseInt(rating || '0', 10),
          date: date || new Date().toISOString()
        })
      }
    }

    // Insert reviews as raw messages
    let insertedCount = 0
    for (const review of reviews) {
      const { error } = await step.run(`insert-review-${review.id}`, async () => {
        return supabase.from('raw_messages').upsert(
          {
            integration_source_id: integrationSourceId,
            project_id: projectId,
            external_id: review.id,
            external_user_name: review.author,
            content: `${review.title}\n\n${review.content}`,
            message_timestamp: review.date,
            metadata: {
              rating: review.rating,
              type: 'app_store_review'
            }
          },
          {
            onConflict: 'integration_source_id,external_id',
            ignoreDuplicates: true
          }
        )
      })

      if (!error) {
        insertedCount++
      }
    }

    // Update last sync time
    await step.run('update-last-sync', async () => {
      await supabase
        .from('integration_sources')
        .update({
          last_sync_at: new Date().toISOString(),
          last_error: null
        })
        .eq('id', integrationSourceId)
    })

    // Trigger processing for new reviews
    const { data: pendingMessages } = await step.run('get-pending-messages', async () => {
      return supabase
        .from('raw_messages')
        .select('id')
        .eq('integration_source_id', integrationSourceId)
        .eq('status', 'pending')
        .limit(50)
    })

    if (pendingMessages) {
      for (const msg of pendingMessages) {
        await step.sendEvent(`process-${msg.id}`, {
          name: 'message/process',
          data: {
            rawMessageId: msg.id,
            projectId
          }
        })
      }
    }

    return {
      fetched: reviews.length,
      inserted: insertedCount,
      pendingProcessing: pendingMessages?.length || 0
    }
  }
)

// Export all functions for the Inngest endpoint
export const functions = [
  processMessage,
  clusterFeedback,
  handleMessageReceived,
  syncSlackChannel,
  pollAppStoreReviews,
  fetchAppStoreReviews
]
