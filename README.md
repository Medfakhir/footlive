# ScoureFootball - Live Football Scores API

A Next.js application that scrapes and displays live football scores from BeSoccer. The application uses Puppeteer for web scraping and displays matches grouped by competition. It also provides a public API that can be integrated into other websites.

## Features

- Live football scores scraped from BeSoccer
- Date navigation to view matches from different days
- Matches grouped by competition
- Live status indicators (live, postponed, or scheduled time)
- Responsive design with light/dark mode support
- Public API with CORS support for external integration
- Detailed match information including team logos and TV broadcast channels

## Tech Stack

- Next.js 15.3.4
- React 19.0.0
- TypeScript
- Tailwind CSS
- Puppeteer for web scraping

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Install Chrome for Puppeteer:

```bash
npx puppeteer browsers install chrome
```

4. Create a `.env.local` file in the project root with the following content (replace the path with your actual Chrome path):

```
PUPPETEER_EXECUTABLE_PATH=/path/to/chrome/executable
```

On macOS, this might look like:
```
PUPPETEER_EXECUTABLE_PATH=/Users/username/.cache/puppeteer/chrome/mac-137.0.7151.119/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploying to Vercel

This project is configured to work with Vercel's serverless functions for Puppeteer. The following configurations have been made:

1. **vercel.json** - Contains configuration for Vercel deployment:
   - Increased memory allocation for API functions (3008MB)
   - Set Puppeteer cache directory to `/tmp/puppeteer-cache`
   - Custom install command to install Chrome during deployment

2. **API Route Configuration** - The `/api/scrape` route uses `@sparticuz/chromium` for Vercel compatibility

3. **Next.js Configuration** - `next.config.ts` includes `serverExternalPackages` for Puppeteer support

### Deployment Steps

1. Push your code to a Git repository (GitHub, GitLab, etc.)

2. Import the project in Vercel:
   - Connect to your Git repository
   - Vercel will automatically detect the Next.js project and use the configuration from `vercel.json`

3. Deploy the project

## Troubleshooting

### Chrome Not Found

If you encounter a "Could not find Chrome" error:

- **Local Development**: Make sure you've installed Chrome for Puppeteer and set the correct path in `.env.local`
- **Vercel Deployment**: The application is configured to use `@sparticuz/chromium` in the Vercel environment

### Memory Issues on Vercel

If you encounter memory issues on Vercel, you may need to adjust the memory allocation in `vercel.json`. The current configuration allocates 3008MB to API functions.

## API Integration

This project includes a public API that can be integrated into other websites. The API provides access to live football match data scraped from BeSoccer.

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

A simple example of how to integrate the API into another website can be found in [example-integration.html](./example-integration.html).

## License

This project is licensed under the MIT License.
