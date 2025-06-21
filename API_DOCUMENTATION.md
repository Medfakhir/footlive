# ScoureFootball API Documentation

## Overview

This documentation provides instructions on how to integrate the ScoureFootball API into external websites. The API provides access to live football match data scraped from BeSoccer.

## API Endpoints

### Get Football Matches

```
GET /api/scrape
```

Returns a list of football matches for a specific date.

#### Query Parameters

| Parameter | Type   | Required | Description                                |
|-----------|--------|----------|--------------------------------------------|  
| date      | string | No       | Date in YYYY-MM-DD format (defaults to today) |

#### Response Format

The API returns a JSON object with the following structure:

```json
{
  "matches": [
    {
      "competition": "Premier League",
      "competitionImage": "https://example.com/image.png",
      "homeTeam": "Team A",
      "awayTeam": "Team B",
      "homeTeamImage": "https://example.com/teamA.png",
      "awayTeamImage": "https://example.com/teamB.png",
      "homeScore": "2",
      "awayScore": "1",
      "matchStatus": "FT",
      "matchTime": "15:00",
      "isLive": false,
      "isPostponed": false,
      "matchId": "12345",
      "matchUrl": "https://www.besoccer.com/match/team-a/team-b/12345",
      "startTime": "2023-09-30T15:00:00Z",
      "dataStatus": "3",
      "tvChannels": ["Channel 1", "Channel 2"]
    }
  ]
}
```

## Integration Examples

### JavaScript/Fetch API

```javascript
async function getFootballMatches(date = null) {
  // Construct the URL with optional date parameter
  const url = date 
    ? `https://your-deployed-site.com/api/scrape?date=${date}` 
    : 'https://your-deployed-site.com/api/scrape';
    
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.matches;
  } catch (error) {
    console.error('Error fetching football matches:', error);
    return [];
  }
}

// Example usage
getFootballMatches('2023-09-30').then(matches => {
  console.log(`Found ${matches.length} matches`);
  // Process matches here
});
```

### React Example

```jsx
import { useState, useEffect } from 'react';

function FootballMatches({ date }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchMatches() {
      setLoading(true);
      try {
        const url = date 
          ? `https://your-deployed-site.com/api/scrape?date=${date}` 
          : 'https://your-deployed-site.com/api/scrape';
          
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setMatches(data.matches);
        setError(null);
      } catch (err) {
        setError('Failed to fetch matches');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMatches();
  }, [date]);
  
  if (loading) return <div>Loading matches...</div>;
  if (error) return <div>Error: {error}</div>;
  if (matches.length === 0) return <div>No matches found</div>;
  
  return (
    <div>
      <h2>Football Matches</h2>
      <ul>
        {matches.map(match => (
          <li key={match.matchId}>
            {match.homeTeam} {match.homeScore} - {match.awayScore} {match.awayTeam}
            {match.isLive && <span className="live-badge">LIVE</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FootballMatches;
```

## CORS Support

The API includes CORS support, allowing it to be accessed from different domains. This means you can integrate the API into your website regardless of where it's hosted.

## Rate Limiting

To ensure service stability, please implement reasonable rate limiting in your application. We recommend:

- Cache responses when possible
- Limit requests to once per minute for the same date parameter
- Implement error handling for failed requests

## Legal Considerations

Please note that this API scrapes data from BeSoccer. When using this API, ensure you comply with BeSoccer's terms of service and provide appropriate attribution where required.

## Support

For questions or issues with the API, please open an issue in the GitHub repository.