// /api/now-playing.ts
import { VercelRequest, VercelResponse } from '@vercel/node'
import fetch from 'node-fetch'

// Type definitions
interface TokenResponse {
    access_token: string;
}

interface SpotifyImage {
    url: string;
    height: number;
    width: number;
}

interface SpotifyArtist {
    name: string;
}

interface SpotifyAlbum {
    name: string;
    images: SpotifyImage[];
}

interface SpotifyTrack {
    name: string;
    artists: SpotifyArtist[];
    album: SpotifyAlbum;
}

interface SpotifyResponse {
    is_playing: boolean;
    item: SpotifyTrack;
}

// Ensure environment variables are available
if (!process.env.SPOTIFY_REFRESH_TOKEN) throw new Error('Missing SPOTIFY_REFRESH_TOKEN')
if (!process.env.SPOTIFY_CLIENT_ID) throw new Error('Missing SPOTIFY_CLIENT_ID')
if (!process.env.SPOTIFY_CLIENT_SECRET) throw new Error('Missing SPOTIFY_CLIENT_SECRET')

// Your Spotify credentials
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

async function getAccessToken(): Promise<string> {
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
        throw new Error('Missing required environment variables')
    }

    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basic}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: REFRESH_TOKEN,
        }).toString()
    })

    const data = await response.json() as TokenResponse
    return data.access_token
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Enable CORS
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET')

        // Get access token using refresh token
        const accessToken = await getAccessToken()

        // Get currently playing song
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })

        if (response.status === 204) {
            return res.status(200).json({ isPlaying: false })
        }

        const song = await response.json() as SpotifyResponse

        return res.status(200).json({
            isPlaying: song.is_playing,
            title: song.item?.name || '',
            artist: song.item?.artists[0]?.name || '',
            album: song.item?.album?.name || '',
            albumArt: song.item?.album?.images[0]?.url || '',
        })
    } catch (error) {
        console.error('Error:', error)
        return res.status(500).json({ error: 'Error fetching now playing' })
    }
}