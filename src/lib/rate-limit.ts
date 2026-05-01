import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const hasRedis = !!(process.env.UPSTASH_REST_URL && process.env.UPSTASH_REST_TOKEN)

const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REST_URL!,
      token: process.env.UPSTASH_REST_TOKEN!,
    })
  : null

export const loginRateLimit = new Ratelimit({
  redis: redis as any,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: false,
  prefix: 'ratelimit:login',
})

export const orderRateLimit = new Ratelimit({
  redis: redis as any,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: false,
  prefix: 'ratelimit:order',
})

export async function safeLimit(
  ratelimit: Ratelimit,
  identifier: string
): Promise<{ success: boolean }> {
  if (!hasRedis) {
    return { success: true }
  }
  try {
    return await ratelimit.limit(identifier)
  } catch {
    return { success: true }
  }
}
