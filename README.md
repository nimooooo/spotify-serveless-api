# Spotify Now Playing API

A serverless Edge API that fetches and displays your currently playing track on Spotify. Built with TypeScript and deployed on Vercel's Edge Runtime.

## Features

- Real-time currently playing track information from Spotify
- Edge runtime for fast, global response times
- CORS enabled for cross-origin requests
- Comprehensive error handling
- TypeScript for type safety

## API Response

The API returns JSON with the following structure:

```json
{
  "isPlaying": boolean,
  "title": string,
  "artist": string,
  "album": string,
  "albumArt": string
}
```

If no track is playing, it returns:
```json
{
  "isPlaying": false
}
```

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   SPOTIFY_REFRESH_TOKEN=your_refresh_token
   ```

### Getting Spotify Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new application
3. Get your Client ID and Client Secret
4. Set up your redirect URI and get your refresh token

## Development

To run the project locally:

```bash
npm run dev
```

## Deployment

This project is designed to be deployed on Vercel. Simply push to your repository and connect it to Vercel for automatic deployments.

Make sure to add your environment variables in your Vercel project settings.

## API Usage

Make a GET request to `/api/now-playing` to receive the currently playing track information:

```javascript
fetch('your-domain.com/api/now-playing')
  .then(response => response.json())
  .then(data => console.log(data));
```

## Error Handling

The API returns appropriate error messages with 500 status code when:
- Required environment variables are missing
- Spotify API token request fails
- Spotify API request fails

## Technologies Used

- TypeScript
- Vercel Edge Runtime
- Spotify Web API

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. 