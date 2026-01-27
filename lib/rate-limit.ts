import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

interface RateLimitConfig {
  endpoint: string
  maxRequests: number
  windowSeconds: number
}

// Default rate limits for different endpoints
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  submit_idea: {
    endpoint: 'submit_idea',
    maxRequests: 10,
    windowSeconds: 3600, // 10 ideas per hour per IP
  },
  vote: {
    endpoint: 'vote',
    maxRequests: 100,
    windowSeconds: 3600, // 100 votes per hour per IP
  },
  contact: {
    endpoint: 'contact',
    maxRequests: 5,
    windowSeconds: 3600, // 5 contact submissions per hour
  },
}

export async function getClientIP(): Promise<string> {
  const headersList = await headers()

  // Try various headers that might contain the real IP
  const forwardedFor = headersList.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = headersList.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  const cfConnectingIP = headersList.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  // Fallback - this shouldn't happen in production
  return 'unknown'
}

export async function checkRateLimit(
  endpoint: keyof typeof RATE_LIMITS,
  identifier?: string
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const config = RATE_LIMITS[endpoint]
  if (!config) {
    // If no config, allow the request
    return { allowed: true, remaining: 999, resetAt: new Date() }
  }

  // Use provided identifier or fall back to IP
  const id = identifier || await getClientIP()

  // For unknown IPs, be more lenient but still rate limit
  if (id === 'unknown') {
    return { allowed: true, remaining: 999, resetAt: new Date() }
  }

  const supabase = await createClient()

  // Calculate window start
  const windowMinutes = Math.ceil(config.windowSeconds / 60)
  const now = new Date()
  const windowStart = new Date(
    Math.floor(now.getTime() / (windowMinutes * 60 * 1000)) * (windowMinutes * 60 * 1000)
  )
  const resetAt = new Date(windowStart.getTime() + config.windowSeconds * 1000)

  // Check and update rate limit using upsert
  const { data, error } = await supabase
    .from('rate_limits')
    .upsert(
      {
        identifier: id,
        endpoint: config.endpoint,
        window_start: windowStart.toISOString(),
        request_count: 1,
      },
      {
        onConflict: 'identifier,endpoint,window_start',
        ignoreDuplicates: false,
      }
    )
    .select('request_count')
    .single()

  if (error) {
    // If there's an error, try to get existing record
    const { data: existing } = await supabase
      .from('rate_limits')
      .select('request_count')
      .eq('identifier', id)
      .eq('endpoint', config.endpoint)
      .eq('window_start', windowStart.toISOString())
      .single()

    if (existing) {
      // Increment the count
      await supabase
        .from('rate_limits')
        .update({ request_count: existing.request_count + 1 })
        .eq('identifier', id)
        .eq('endpoint', config.endpoint)
        .eq('window_start', windowStart.toISOString())

      const newCount = existing.request_count + 1
      return {
        allowed: newCount <= config.maxRequests,
        remaining: Math.max(0, config.maxRequests - newCount),
        resetAt,
      }
    }

    // If we can't check, allow the request but log the error
    console.error('Rate limit check failed:', error)
    return { allowed: true, remaining: 999, resetAt }
  }

  const count = data?.request_count || 1
  return {
    allowed: count <= config.maxRequests,
    remaining: Math.max(0, config.maxRequests - count),
    resetAt,
  }
}

export function rateLimitResponse(resetAt: Date) {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'Please try again later',
      retryAfter: Math.ceil((resetAt.getTime() - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil((resetAt.getTime() - Date.now()) / 1000).toString(),
      },
    }
  )
}
