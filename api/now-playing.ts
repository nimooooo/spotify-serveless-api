// /api/now-playing.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { fetch } from 'undici'

// Type definitions
interface TokenResponse {
    access_token: string;
}

interface SpotifyResponse {
    is_playing: boolean;
    item?: {
        name: string;
        artists: Array<{ name: string }>;
        album: {
            name: string;
            images: Array<{ url: string }>;
        };
    };
}

export const config = {
    runtime: 'edge',
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Validate environment variables
        if (!process.env.SPOTIFY_REFRESH_TOKEN || 
            !process.env.SPOTIFY_CLIENT_ID || 
            !process.env.SPOTIFY_CLIENT_SECRET) {
            throw new Error('Missing required environment variables')
        }

        // Get access token
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(
                    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                ).toString('base64')}`
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: process.env.SPOTIFY_REFRESH_TOKEN
            }).toString()
        })

        if (!tokenResponse.ok) {
            throw new Error(`Token request failed: ${tokenResponse.status}`)
        }

        const { access_token } = await tokenResponse.json() as TokenResponse

        // Get currently playing song
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })

        if (response.status === 204) {
            return new Response(JSON.stringify({ isPlaying: false }), {
                headers: { 'Content-Type': 'application/json' }
            })
        }

        if (!response.ok) {
            throw new Error(`Spotify API request failed: ${response.status}`)
        }

        const data = await response.json() as SpotifyResponse

        return new Response(JSON.stringify({
            isPlaying: data.is_playing,
            title: data.item?.name || '',
            artist: data.item?.artists[0]?.name || '',
            album: data.item?.album?.name || '',
            albumArt: data.item?.album?.images[0]?.url || ''
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET'
            }
        })
    } catch (error) {
        return new Response(JSON.stringify({ 
            error: 'Error fetching now playing',
            details: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        })
    }
}