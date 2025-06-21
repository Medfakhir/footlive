# Deploying to Cloudflare Workers

This project can be deployed to Cloudflare Workers using Wrangler. The following configurations have been made:

## Configuration Files

1. **wrangler.toml** - Contains configuration for Cloudflare Workers deployment:
   - Specifies the entry point for the API route
   - Sets memory allocation for the worker (1024MB)
   - Configures timeout settings (60 seconds)
   - Sets up static asset handling

2. **Package.json** - Updated with:
   - `deploy` script for Wrangler deployment
   - Wrangler as a dev dependency

## Deployment Steps

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Build the Application**:
   ```bash
   npm run build
   ```

3. **Deploy to Cloudflare Workers**:
   ```bash
   npm run deploy
   ```

4. **Authenticate with Cloudflare** (if prompted):
   - Follow the authentication prompts to log in to your Cloudflare account
   - You may need to create a Cloudflare API token with appropriate permissions

## Telemetry

Cloudflare collects anonymous telemetry about your usage of Wrangler. You can opt out by running:

```bash
npx wrangler telemetry disable
```

Or by setting the environment variable:

```bash
WRANGLER_SEND_METRICS=false
```

For more information, see: https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler/telemetry.md