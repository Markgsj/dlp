
# DLP Trip Assistant (Beta)

A lightweight web app for **Disneyland Paris** that shows **live ride wait times**, alerts you when a ride **goes down**, checks for **rain in the next few hours**, and displays a **map** of the parks.

> Data: Powered by Queue-Times.com (free real-time API). Weather by OpenWeather One Call 3.0.
> You must leave the "Powered by Queue-Times.com" attribution visible to use their API.

## Features
- Live wait times for **Disneyland Park (4)** and **Walt Disney Studios (6)**
- Alerts when a ride **changes to closed**
- **Rain alert** for the next 3 hours (OpenWeather)
- Leaflet **map** (OpenStreetMap tiles). If the API exposes ride coordinates, pins are shown.
- Simple, phone-friendly UI
- Refreshes every **5 minutes**

## Quick Start

1. **Install Node.js** (18+ recommended).
2. Clone or unzip this folder.
3. Copy `.env.example` to `.env` and set your OpenWeather key:

```
OPENWEATHER_API_KEY=your-key-here
PORT=8787
```

4. Install dependencies and start:

```
npm install
npm run start
```

5. Open http://localhost:8787 in your browser.

## Deploying
- Works on Render, Railway, Fly.io, or any Node host.
- Remember to set `OPENWEATHER_API_KEY` in environment variables.
- The server serves the static frontend from `/web`.

## Notes & Limitations
- Queue-Times API updates every 5 minutes. Keep the attribution visible. See API docs: https://queue-times.com/en-US/pages/api
- Ride coordinates are not always present in the API. The app shows pins only when coordinates are provided.
- For **turn-by-turn routing** inside the park, consider integrating an OSRM/Mapbox routing backend with Leaflet Routing Machine.
- The rain alert is a simple heuristic (>=50% precipitation probability or reported rainfall in next 3 hours). Adjust logic in `web/app.js` to your taste.
- This is a minimal, transparent codebase you can extend (notifications, favourites, indoor-first plan on rain, etc.).

## Park IDs (Queue-Times)
- Disneyland Park Paris: **4**
- Walt Disney Studios Paris: **6**

## Credits
- Queue-Times API (free, with attribution)
- OpenWeather One Call 3.0
- Leaflet (OpenStreetMap tiles)



---

## One-Click Deploy to Render (Blueprint)

1. Push this repo to GitHub (or create a private repo and upload files).
2. On Render, click **New + → Blueprint** and point it at your GitHub repo URL.
3. After it creates the service, set the environment variable:
   - `OPENWEATHER_API_KEY` = your OpenWeather key
4. Click **Manual Deploy** (or wait for auto deploy). Your app will be live at an HTTPS URL.

