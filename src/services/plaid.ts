/**
 * Plaid service helpers
 * Handles Plaid Link token generation and bank connection flows
 */

// Plaid configuration
export const PLAID_CONFIG = {
  clientId: process.env.EXPO_PUBLIC_PLAID_CLIENT_ID || '',
  environment: process.env.EXPO_PUBLIC_PLAID_ENVIRONMENT || 'sandbox',
  linkTokenEndpoint: process.env.EXPO_PUBLIC_PLAID_LINK_TOKEN_ENDPOINT || '',
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
export async function fetchPlaidLinkToken(userId?: string): Promise<string | null> {
  if (!PLAID_CONFIG.linkTokenEndpoint) {
    console.error('Plaid Link Token endpoint not configured')
    return null
  }

  try {
    const response = await fetch(PLAID_CONFIG.linkTokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId || 'anonymous_user',
        environment: PLAID_CONFIG.environment,
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
export async function exchangePublicToken(publicToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${getBackendBaseUrl()}/api/plaid/exchange-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
  return {
    clientId: PLAID_CONFIG.clientId,
    environment: PLAID_CONFIG.environment,
    isReady: !!PLAID_CONFIG.clientId && !!PLAID_CONFIG.linkTokenEndpoint,
  }
}

/**
 * Resolve backend base URL from config
 */
function getBackendBaseUrl(): string {
  if (PLAID_CONFIG.backendBaseUrl) return PLAID_CONFIG.backendBaseUrl
  try {
    const url = new URL(PLAID_CONFIG.linkTokenEndpoint)
    return `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}`
  } catch {
    return ''
  }
}


