/**
 * Plaid service helpers
 * Note: You must provide a server endpoint that returns a Link Token.
 * Set EXPO_PUBLIC_PLAID_LINK_TOKEN_ENDPOINT to that endpoint URL.
 */

export async function fetchPlaidLinkToken(): Promise<string | null> {
  const endpoint = process.env.EXPO_PUBLIC_PLAID_LINK_TOKEN_ENDPOINT
  if (!endpoint) return null
  try {
    const res = await fetch(endpoint, { method: 'POST' })
    if (!res.ok) return null
    const data = await res.json()
    return data.link_token || data.linkToken || null
  } catch {
    return null
  }
}


