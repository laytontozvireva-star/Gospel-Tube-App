# GospelTube API Documentation

Your own backend API built on **Supabase Edge Functions**.
Aggregates gospel content from YouTube, Vimeo, Spotify, SoundCloud, and Apple Podcasts.

**Base URL:** `https://amuqpucghtfmdchbsaqt.supabase.co/functions/v1`

---

## Setup

### 1. Get API Keys

| Platform | Where | Cost |
|---|---|---|
| Spotify | https://developer.spotify.com/dashboard | Free |
| SoundCloud | https://developers.soundcloud.com | Free |
| Vimeo | https://developer.vimeo.com | Free |
| Apple Podcasts | No key needed | Free |

### 2. Add keys to Supabase Edge Function secrets

```bash
npx supabase secrets set YOUTUBE_API_KEY=your_key
npx supabase secrets set SPOTIFY_CLIENT_ID=your_id
npx supabase secrets set SPOTIFY_CLIENT_SECRET=your_secret
npx supabase secrets set SOUNDCLOUD_CLIENT_ID=your_id
npx supabase secrets set VIMEO_ACCESS_TOKEN=your_token
```

### 3. Deploy all functions

```bash
npx supabase functions deploy feed
npx supabase functions deploy videos
npx supabase functions deploy music
npx supabase functions deploy podcasts
npx supabase functions deploy live
npx supabase functions deploy apostles
npx supabase functions deploy comments
npx supabase functions deploy likes
npx supabase functions deploy history
npx supabase functions deploy playlists
```

---

## Endpoints

### GET /feed
Unified gospel content feed from all platforms.

**Query params:**
- `q` — search term (default: `gospel`)
- `type` — `all` | `video` | `music` | `podcast` (default: `all`)
- `limit` — max results per source, max 15 (default: `8`)

**Example:**
```
GET /feed?q=sermon&type=video
```

**Response:**
```json
{
  "results": [
    {
      "id": "abc123",
      "source": "youtube",
      "type": "video",
      "title": "Sunday Sermon",
      "thumbnail": "https://...",
      "url": "https://youtube.com/watch?v=abc123",
      "author": "Pastor John",
      "publishedAt": "2026-09-15T10:00:00Z"
    },
    {
      "id": "xyz789",
      "source": "spotify",
      "type": "music",
      "title": "Amazing Grace",
      ...
    }
  ],
  "total": 24,
  "sources": {
    "youtube": 8, "vimeo": 4, "spotify": 8, "soundcloud": 4, "apple_podcasts": 0
  }
}
```

---

### GET /videos
Videos from YouTube and/or Vimeo.

| Param | Values | Default |
|---|---|---|
| `q` | search term | `gospel sermon` |
| `source` | `all`, `youtube`, `vimeo` | `all` |
| `limit` | 1-25 | `10` |

### GET /videos/:youtubeId
Single YouTube video with full details.

---

### GET /music
Gospel music from Spotify and/or SoundCloud.

| Param | Values | Default |
|---|---|---|
| `q` | search term | `gospel worship` |
| `source` | `all`, `spotify`, `soundcloud` | `all` |
| `limit` | 1-25 | `10` |

---

### GET /podcasts
Gospel podcasts from Apple Podcasts + Spotify.

| Param | Description |
|---|---|
| `q` | search term (default: `gospel`) |
| `feed` | RSS feed URL — returns episodes from that specific feed |
| `limit` | max results (default: `10`) |

**Example — episodes from a specific ministry:**
```
GET /podcasts?feed=https://ministry.com/rss.xml
```

---

### GET /live
Currently live gospel YouTube streams.

| Param | Default |
|---|---|
| `q` | `gospel live stream` |

---

### GET /apostles
List all apostles/speakers from your database.

### GET /apostles/:id
Single apostle with all their published videos.

---

### GET /comments?videoId=:id
List comments for a video.

### POST /comments *(🔒 Auth required)*
```json
{ "videoId": "abc", "content": "Amen!" }
```

### DELETE /comments/:id *(🔒 Auth required)*

---

### GET /likes *(🔒 Auth required)*
Get all videos liked by the current user.

### POST /likes/:videoId *(🔒 Auth required)*
Toggle like on a video. Returns `{ "liked": true }` or `{ "liked": false }`.

---

### GET /history *(🔒 Auth required)*
Get watch history.

### POST /history *(🔒 Auth required)*
```json
{ "videoId": "abc", "progressSeconds": 120 }
```

### DELETE /history *(🔒 Auth required)*
Clear all watch history.

---

### GET /playlists
List public playlists (+ user playlists when authenticated).

### POST /playlists *(🔒 Auth required)*
```json
{ "name": "My Worship", "description": "...", "isPublic": true }
```

### GET /playlists/:id/videos
Videos in a playlist.

### POST /playlists/:id/videos *(🔒 Auth required)*
```json
{ "videoId": "abc" }
```

### DELETE /playlists/:id *(🔒 Auth required)*

---

## Using the API in your React app

```js
import { gospelApi } from "./src/lib/api";

// Mixed feed
const feed = await gospelApi.getFeed({ q: "sermon", type: "all" });

// Just music
const music = await gospelApi.getMusic({ q: "worship" });

// Live streams
const live = await gospelApi.getLiveStreams();

// Podcasts
const podcasts = await gospelApi.getPodcasts({ q: "gospel devotion" });
```
