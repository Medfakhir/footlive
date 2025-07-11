import { NextResponse } from 'next/server';
import { Match } from '@/types';
import puppeteer from 'puppeteer-core';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    // Use provided date or default to today
    let dateString;
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      dateString = dateParam;
      console.log(`Scraping BeSoccer for matches on ${dateParam}...`);
    } else {
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
      console.log('Scraping BeSoccer for today\'s matches...');
    }
    
    // Launch Puppeteer browser with configuration for both local and Vercel environments
    let browser;
    
    // Check if running on Vercel or locally
    if (process.env.VERCEL) {
      console.log('Running on Vercel, using pre-installed Chromium');
      // Setup for Vercel serverless environment
      try {
        console.log('Using Vercel serverless environment configuration');
        
        // Use a simpler approach based on StackOverflow solution
        // Instead of trying to install Chromium at runtime, use a pre-installed path
        const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser';
        console.log(`Using Chromium executable path: ${executablePath}`);
        
        // Launch browser with minimal configuration
        browser = await puppeteer.launch({
          args: [
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-sandbox',
            '--disable-gpu',
            '--single-process',
            '--no-zygote'
          ],
          executablePath: executablePath,
          headless: true,
          dumpio: true // Log browser process stdout and stderr
        });
          
        console.log('Browser launched successfully in Vercel environment');
      } catch (error) {
        console.error('Error launching browser in Vercel:', error);
        throw error;
      }
    } else {
      console.log('Running locally');
      // Setup for local development
      const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security'
      ];
      
      // Add executable path if specified in environment variables
      if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        console.log('Using local Chrome executable path');
        browser = await puppeteer.launch({
          executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
          headless: true,
          args
        });
        console.log('Browser launched successfully in local environment');
      } else {
        throw new Error('PUPPETEER_EXECUTABLE_PATH environment variable is not set');
      }
    }
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to the page
    await page.goto(`https://www.besoccer.com/livescore/${dateString}`, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Extract match data
    const matches: Match[] = await page.evaluate(() => {
      const matchData: Match[] = [];
      
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
            const tvChannels: string[] = [];
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
    console.log(`Scraping complete. Found ${matches.length} matches.`);
    
    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Error scraping BeSoccer:', error);
    return NextResponse.json(
      { error: 'Failed to scrape football scores' },
      { status: 500 }
    );
  }
}