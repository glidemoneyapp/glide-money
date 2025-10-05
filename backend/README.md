# GlideMoney Backend

Backend API server for GlideMoney app with Plaid integration for bank account connections and transaction syncing.

## Features

- 🔐 **Plaid Integration** - Secure bank account connections
- 💳 **Transaction Sync** - Automatic transaction import and categorization
- 🏦 **Account Management** - Multi-account support
- 🔒 **Secure API** - Token-based authentication

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Plaid Account

1. Sign up for a [Plaid Developer account](https://plaid.com/developers/)
2. Create a new application
3. Copy your `client_id` and `secret` from the dashboard

### 3. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your Plaid credentials
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret_key
PLAID_ENVIRONMENT=sandbox
PORT=3001
```

### 4. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Plaid Integration

- `POST /api/plaid/create-link-token` - Create Plaid Link token
- `POST /api/plaid/exchange-token` - Exchange public token for access token
- `POST /api/plaid/transactions` - Fetch transactions
- `POST /api/plaid/accounts` - Fetch connected accounts

### Health Check

- `GET /health` - Server health status
- `GET /` - API information

## Usage Examples

### Create Link Token

```bash
curl -X POST http://localhost:3001/api/plaid/create-link-token \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user123"}'
```

### Exchange Public Token

```bash
curl -X POST http://localhost:3001/api/plaid/exchange-token \
  -H "Content-Type: application/json" \
  -d '{"public_token": "public-sandbox-..."}'
```

## Plaid Sandbox Testing

The server is configured for Plaid's sandbox environment, which provides:

- **Test Credentials**: Use any username/password
- **Sample Data**: Pre-loaded transactions and accounts
- **No Real Money**: Safe testing environment

### Test Credentials (Sandbox)

- **Username**: `user_good`
- **Password**: `pass_good`
- **Institution**: `Chase` or `Bank of America`

## Development

### Project Structure

```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies
├── .env.example       # Environment template
└── README.md          # This file
```

### Adding New Endpoints

1. Add route handler in `server.js`
2. Update API documentation
3. Test with curl or Postman

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a production Plaid environment (`development` or `production`)
3. Set up proper database for storing access tokens
4. Configure webhook URLs for real-time updates
5. Use HTTPS and proper security headers

## Troubleshooting

### Common Issues

1. **"Missing Plaid credentials"**
   - Check your `.env` file
   - Ensure `PLAID_CLIENT_ID` and `PLAID_SECRET` are set

2. **"Failed to create link token"**
   - Verify Plaid credentials are correct
   - Check Plaid environment setting

3. **CORS errors**
   - Ensure your frontend URL is allowed
   - Check CORS configuration in `server.js`

### Logs

The server logs all requests and errors to the console. Check the terminal output for debugging information.

## Security Notes

- Never commit `.env` files to version control
- Use environment variables for all sensitive data
- Implement proper authentication for production
- Store access tokens securely (database recommended)
- Use HTTPS in production

## Support

For issues related to:
- **Plaid Integration**: Check [Plaid Documentation](https://plaid.com/docs/)
- **Backend Issues**: Check server logs and error messages
- **API Usage**: Review endpoint documentation above
