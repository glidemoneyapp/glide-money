/**
 * Plaid service helpers
 * Handles Plaid Link token generation and bank connection flows
 */

// Client must never include Plaid secrets. Backend brokers all Plaid calls.
export const PLAID_CONFIG = {
  backendBaseUrl: process.env.EXPO_PUBLIC_BACKEND_BASE_URL || ''
}

// Plaid Link token response type
export interface PlaidLinkTokenResponse {
  link_token: string
  expiration: string
}

// Plaid Link success response type
export interface PlaidLinkSuccessResponse {
  // react-native-plaid-link-sdk returns publicToken (camelCase)
  publicToken: string
  metadata: {
    institution: {
      name: string
      institution_id: string
    }
    accounts: Array<{
      id: string
      name: string
      type: string
      subtype: string
    }>
  }
}

/**
 * Fetch Plaid Link token from backend
 */
export async function fetchPlaidLinkToken(userId?: string, idToken?: string): Promise<string | null> {
  if (!PLAID_CONFIG.backendBaseUrl) {
    console.error('Missing EXPO_PUBLIC_BACKEND_BASE_URL')
    return null
  }

  try {
    const response = await fetch(`${PLAID_CONFIG.backendBaseUrl}/api/plaid/create-link-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) },
      body: JSON.stringify({
        user_id: userId || 'anonymous_user',
      }),
    })

    if (!response.ok) {
      console.error('Failed to fetch Plaid Link token:', response.status)
      return null
    }

    const data: PlaidLinkTokenResponse = await response.json()
    return data.link_token
  } catch (error) {
    console.error('Error fetching Plaid Link token:', error)
    return null
  }
}

/**
 * Exchange public token for access token
 */
export async function exchangePublicToken(publicToken: string, idToken?: string): Promise<boolean> {
  try {
    const response = await fetch(`${getBackendBaseUrl()}/api/plaid/exchange-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) },
      body: JSON.stringify({
        public_token: publicToken,
      }),
    })

    return response.ok
  } catch (error) {
    console.error('Error exchanging public token:', error)
    return false
  }
}

/**
 * Get Plaid configuration for Link SDK
 */
export function getPlaidConfig() {
  return { isReady: !!PLAID_CONFIG.backendBaseUrl }
}

/**
 * Resolve backend base URL from config
 */
function getBackendBaseUrl(): string {
  return PLAID_CONFIG.backendBaseUrl
}


