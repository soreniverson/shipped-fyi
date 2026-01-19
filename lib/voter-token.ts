const VOTER_TOKEN_KEY = 'shipped_voter_token'

export function getVoterToken(): string {
  if (typeof window === 'undefined') return ''

  let token = localStorage.getItem(VOTER_TOKEN_KEY)
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem(VOTER_TOKEN_KEY, token)
  }
  return token
}
