/**
 * GlideMoney Backend Server
 * Provides API endpoints for Plaid integration and other services
 */

const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid')
const admin = require('firebase-admin')

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Initialize Firebase Admin (requires GOOGLE_APPLICATION_CREDENTIALS or default creds)
try {
  if (!admin.apps.length) admin.initializeApp()
} catch (e) {
  console.warn('Firebase Admin init warning:', e.message)
}
const db = admin.apps.length ? admin.firestore() : null

// Plaid Configuration
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID
const PLAID_SECRET = process.env.PLAID_SECRET
const PLAID_ENV = process.env.PLAID_ENVIRONMENT || 'sandbox'

if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
  console.error('Missing Plaid credentials. Please set PLAID_CLIENT_ID and PLAID_SECRET environment variables.')
  process.exit(1)
}

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
    },
  },
})

const plaidClient = new PlaidApi(configuration)

// Helper: save/get Plaid access token securely per user
async function saveAccessToken(uid, accessToken) {
  if (!db) return
  await db.collection('userPrivate').doc(uid).set({ plaidAccessToken: accessToken }, { merge: true })
}

async function getAccessToken(uid) {
  if (!db) return null
  const snap = await db.collection('userPrivate').doc(uid).get()
  return snap.exists ? snap.data().plaidAccessToken : null
}

// Optional auth middleware verifying Firebase ID token
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Missing auth token' })
    req.user = await admin.auth().verifyIdToken(token)
    next()
  } catch (e) {
    res.status(401).json({ error: 'Invalid auth token' })
  }
}

/**
 * Create Link Token endpoint
 */
app.post('/api/plaid/create-link-token', requireAuth, async (req, res) => {
  try {
    const { user_id } = req.body

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' })
    }

    const linkTokenRequest = {
      user: {
        client_user_id: user_id,
      },
      client_name: 'GlideMoney',
      products: ['transactions', 'auth'],
      country_codes: ['US'],
      language: 'en'
    }

    const response = await plaidClient.linkTokenCreate(linkTokenRequest)
    
    res.json({
      link_token: response.data.link_token,
      expiration: response.data.expiration,
    })
  } catch (error) {
    console.error('Error creating link token:', error)
    res.status(500).json({ 
      error: 'Failed to create link token',
      details: error.message 
    })
  }
})

/**
 * Exchange Public Token endpoint
 */
app.post('/api/plaid/exchange-token', requireAuth, async (req, res) => {
  try {
    const { public_token } = req.body

    if (!public_token) {
      return res.status(400).json({ error: 'public_token is required' })
    }

    const response = await plaidClient.itemPublicTokenExchange({ public_token })
    const accessToken = response.data.access_token
    await saveAccessToken(req.user.uid, accessToken)

    res.json({
      access_token: accessToken,
      item_id: response.data.item_id,
    })
  } catch (error) {
    console.error('Error exchanging public token:', error)
    res.status(500).json({ 
      error: 'Failed to exchange public token',
      details: error.message 
    })
  }
})

/**
 * Get Transactions endpoint
 */
app.post('/api/plaid/transactions', async (req, res) => {
  try {
    const { access_token, start_date, end_date, user_id } = req.body
    const token = access_token || (await getAccessToken(user_id))
    if (!token) return res.status(400).json({ error: 'access_token is required' })

    const transactionsRequest = {
      access_token: token,
      start_date: start_date || '2020-01-01',
      end_date: end_date || new Date().toISOString().split('T')[0],
    }

    const response = await plaidClient.transactionsGet(transactionsRequest)
    
    res.json({
      transactions: response.data.transactions,
      total_transactions: response.data.total_transactions,
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    res.status(500).json({ 
      error: 'Failed to fetch transactions',
      details: error.message 
    })
  }
})

/**
 * Get Accounts endpoint
 */
app.post('/api/plaid/accounts', async (req, res) => {
  try {
    const { access_token } = req.body

    if (!access_token) {
      return res.status(400).json({ error: 'access_token is required' })
    }

    const accountsRequest = {
      access_token: access_token,
    }

    const response = await plaidClient.accountsGet(accountsRequest)
    
    res.json({
      accounts: response.data.accounts,
      item: response.data.item,
    })
  } catch (error) {
    console.error('Error fetching accounts:', error)
    res.status(500).json({ 
      error: 'Failed to fetch accounts',
      details: error.message 
    })
  }
})

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    plaid_environment: PLAID_ENV 
  })
})

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({ 
    message: 'GlideMoney Backend API',
    version: '1.0.0',
    endpoints: [
      'POST /api/plaid/create-link-token',
      'POST /api/plaid/exchange-token',
      'POST /api/plaid/transactions',
      'POST /api/plaid/accounts',
      'GET /health'
    ]
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GlideMoney Backend running on port ${PORT}`)
  console.log(`📊 Plaid Environment: ${PLAID_ENV}`)
  console.log(`🔗 API Base URL: http://localhost:${PORT}`)
  console.log(`\nAvailable endpoints:`)
  console.log(`  POST /api/plaid/create-link-token`)
  console.log(`  POST /api/plaid/exchange-token`)
  console.log(`  POST /api/plaid/transactions`)
  console.log(`  POST /api/plaid/accounts`)
  console.log(`  GET  /health`)
})
