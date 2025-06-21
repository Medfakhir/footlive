// Cloudflare Worker entry point

/**
 * Handle incoming requests to the worker
 * @param {Request} request - The incoming request
 * @param {Object} env - Environment variables
 * @param {Object} ctx - Context object
 * @returns {Promise<Response>} - The response
 *
 * NOTE: This worker uses Puppeteer for web scraping which is CPU intensive.
 * On the Cloudflare Workers free plan, there's a 10ms CPU time limit per request.
 * This worker will likely exceed that limit and may require upgrading to a paid plan.
 * Consider implementing caching strategies to reduce the number of scraping operations.
 */
export default {
  async fetch(request, env, ctx) {
    // Set CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };

    // Handle OPTIONS request for CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    try {
      // Only allow GET requests to the API
      if (request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      // Parse the URL to get search parameters
      const url = new URL(request.url);
      const dateParam = url.searchParams.get('date');
      
      // Validate date parameter if provided
      if (dateParam && !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        return new Response(JSON.stringify({ error: 'Invalid date format. Use YYYY-MM-DD' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      // Get today's date in YYYY-MM-DD format if no date provided
      let dateString = dateParam;
      if (!dateString) {
        const today = new Date();
        dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
      }

      // Configure Puppeteer for Cloudflare Workers environment
      const puppeteer = require('puppeteer-core');
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security'
        ]
      });
      
      const page = await browser.newPage();
      await page.setViewport({ width: 1366, height: 768 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigate to the page
      await page.goto(`https://www.besoccer.com/livescore/${dateString}`, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      // Extract match data
      const matches = await page.evaluate(() => {
        const matchData = [];
        
        // Process each match panel
        document.querySelectorAll('.panel').forEach(panel => {
          const competition = panel.querySelector('.panel-title span')?.textContent?.trim() || 'Football';
          const competitionImage = panel.querySelector('.panel-title img')?.getAttribute('src') || '';
          
          panel.querySelectorAll('.match-link').forEach(matchEl => {
            const homeTeamEl = matchEl.querySelector('.team-info.ta-r .team-name');
            const awayTeamEl = matchEl.querySelector('.team-info:not(.ta-r) .team-name');
            
            if (homeTeamEl && awayTeamEl) {
              const homeTeam = homeTeamEl.textContent?.trim() || '';
              const awayTeam = awayTeamEl.textContent?.trim() || '';
              
              // Extract team images
              const homeTeamImage = matchEl.querySelector('.team-info.ta-r img')?.getAttribute('src') || '';
              const awayTeamImage = matchEl.querySelector('.team-info:not(.ta-r) img')?.getAttribute('src') || '';
              
              // Extract scores
              let homeScore = '0';
              let awayScore = '0';
              const marker = matchEl.querySelector('.marker');
              if (marker) {
                const r1 = marker.querySelector('.r1');
                const r2 = marker.querySelector('.r2');
                if (r1) homeScore = r1.textContent?.trim() || '0';
                if (r2) awayScore = r2.textContent?.trim() || '0';
              }
              
              // Extract match status and time
              let matchStatus = 'TBD';
              let matchTime = '';
              let isLive = false;
              let isPostponed = false;
              
              // Check for live status
              const liveTag = matchEl.querySelector('.date .tag-nobg.live');
              if (liveTag) {
                isLive = true;
                matchStatus = liveTag.querySelector('b')?.textContent?.trim() || 'LIVE';
              }
              
              // Check for postponed status
              const postponedTag = matchEl.querySelector('.date .tag-nobg.apl');
              if (postponedTag) {
                isPostponed = true;
                matchStatus = 'Postponed';
              }
              
              // Extract time if not live or postponed
              if (!isLive && !isPostponed) {
                const timeEl = matchEl.querySelector('.match_hour');
                if (timeEl) {
                  matchTime = timeEl.textContent?.trim() || '';
                  matchStatus = matchTime;
                }
              }
              
              // Extract match ID and URL
              const matchUrl = matchEl.getAttribute('href') || '';
              const matchId = matchUrl.split('/').pop() || '';
              
              // Extract start time from attribute
              const startTime = matchEl.getAttribute('starttime') || '';
              
              // Extract data status
              const dataStatus = matchEl.getAttribute('data-status') || '-1';
              
              // Extract TV channels
              const tvChannels = [];
              matchEl.querySelectorAll('.tvs .tv-icon').forEach(tvIcon => {
                const tvName = tvIcon.getAttribute('data-tooltip') || '';
                if (tvName) tvChannels.push(tvName);
              });
              
              // Only add matches with valid team names
              if (homeTeam && awayTeam) {
                matchData.push({
                  competition,
                  competitionImage,
                  homeTeam,
                  awayTeam,
                  homeTeamImage,
                  awayTeamImage,
                  homeScore,
                  awayScore,
                  matchStatus,
                  matchTime,
                  isLive,
                  isPostponed,
                  matchId,
                  matchUrl: `https://www.besoccer.com${matchUrl}`,
                  startTime,
                  dataStatus,
                  tvChannels
                });
              }
            }
          });
        });
        
        return matchData;
      });
      
      await browser.close();
      
      // Return the matches as JSON
      return new Response(JSON.stringify({ matches }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    } catch (error) {
      // Handle errors
      return new Response(JSON.stringify({ error: 'Failed to scrape football scores' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
  },
};