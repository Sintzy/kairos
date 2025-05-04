# Kairos Project

A real‑time in‑bus information display built with Next.js (App Router), MongoDB, OpenRouteService, OpenWeatherMap and a Discord bot. Shows:

- 🌡️ Current weather at the bus’s GPS position
- 🎶 “Now Playing” music info
- 🚏 Estimated time & distance remaining to destination

Perfect for mounting on a screen inside any vehicle and keeping passengers informed.


## 💡 Information
> This is **not** a production-ready application. It is an application made for a very specific purpose. This is also not a plug-and-play solution. You will need to modify the code to fit your needs and environment.

> You will need to develop a solution to update your current location. This can be done using a GPS module or a mobile device with GPS capabilities. You will also need to develop a solution to send the current location to the server. This can be done using a mobile app or a web app.


## 🧩 Key Features

- **Weather Widget**  
  Fetches temperature, humidity and icon for the bus’s current GPS coordinates via OpenWeatherMap.

- **Music Player Info**  
  “Now Playing” component displaying current track metadata via spotify.

- **ETA & Distance**  
  On‑the‑fly routing using OpenRouteService driving‑car profile, calculating remaining time & kilometers from live GPS → destination.

- **Discord Bot**  
  Accepts shared Google Maps links (route link, the link you share before start the trip) to start/end trips:
    - Starts a trip: extracts origin & destination, geocodes them, stores in MongoDB
    - Ends a trip: clears the active record

- **Event Logging**  
  Pushes start, location updates and end‑trip events to LogSnag for real‑time monitoring.

- **Hosting**  
  Deployed as Serverless Functions on Vercel and Discloud.


![oreview1](https://r2.fivemanage.com/icFvuIKk9ch17iXgkGhC0/Capturadeecr2025-04-21143210.png)
## 🚀 Tech Stack

| Layer            | Technology                                   |
| ---------------- | --------------------------------------------- |
| **Framework**    | Next.js 13 (App Router) + React (Client Components) |
| **Database**     | MongoDB Atlas                                 |
| **Routing API**  | OpenRouteService (driving‑car)                |
| **Weather API**  | OpenWeatherMap (Current Weather)              |
| **Bot**          | Discord.js v14 + Axios                        |
| **Logging**      | LogSnag SDK                                   |
| **Hosting**      | Vercel Serverless                             |

---



## 🎛️ Configuration

Setup the ENV File
```env 
##### ENV FILE FOR SERVER #####
# Mongodb API credentials
MONGODB_URI=

# Openrouteservice API credentials
ORS_API_KEY=

# OpenWeather API credentials
OPENWEATHER_API_KEY=

# Logsnap API credentials
LOGSNAG_TOKEN=

# Spotify API links
NOW_PLAYING_ENDPOINT=https://api.spotify.com/v1/me/player/currently-playing
QUEUE_ENDPOINT=https://api.spotify.com/v1/me/player/queue
TOKEN_ENDPOINT=https://accounts.spotify.com/api/token

# Spotify API credentials
NEXT_PUBLIC_CLIENT_ID=
NEXT_PUBLIC_CLIENT_SECRET=
NEXT_PUBLIC_REFRESH_TOKEN=

```

```env
##### DISCORD BOT CONFIGURATION #####
# Discord bot token
TOKEN=

# Your server /api/viagem. 
API_URL=https://yourdomain.com/api/viagem

# Your Logsnag API token
LOGSNAG_TOKEN=
```

### How to get the Spotify Refresh Token?
- Follow this [guide](https://medium.com/@vinhp/the-diy-guide-to-generating-refresh-tokens-for-spotify-api-calls-4eaec82734e4)

