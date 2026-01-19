import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkProjectLimit } from '@/lib/subscription'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await checkProjectLimit(user.id)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Limit check error:', error)
    return NextResponse.json({ allowed: true })
  }
}
