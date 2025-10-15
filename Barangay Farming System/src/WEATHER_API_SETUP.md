# Weather API Setup Guide

The Plant n' Plan system now features **automatic location detection** for accurate, real-time weather forecasts!

## Features
- 🌍 **Auto-location detection** using browser geolocation
- 🌤️ **Real-time weather data** from OpenWeatherMap
- 📊 **3-day forecast** for better planning
- ⚠️ **Smart weather alerts** for extreme conditions
- 🔄 **Manual refresh** button to update weather data

## How It Works

1. **Automatic Location**: The app automatically requests your browser location on first load
2. **Permission Required**: You'll see a browser prompt asking for location access
3. **Real Weather Data**: Once granted, the app fetches real weather data for your exact location
4. **Fallback**: If location is denied or unavailable, mock weather data is used

## Optional: Get Your Free API Key (Recommended for Production)

For the most accurate weather data, you can set up a free OpenWeatherMap API key:

### Step 1: Sign Up
1. Go to [https://openweathermap.org/api](https://openweathermap.org/api)
2. Click "Sign Up" and create a free account
3. Verify your email address

### Step 2: Get Your API Key
1. Log in to your OpenWeatherMap account
2. Go to "API keys" section in your profile
3. Copy your API key (or generate a new one)

### Step 3: Add to Your Project
1. Create a `.env` file in your project root (if it doesn't exist)
2. Add this line:
   ```
   VITE_OPENWEATHER_API_KEY=your_api_key_here
   ```
3. Replace `your_api_key_here` with your actual API key

### Step 4: Restart Your App
If your app is running, restart it to load the new environment variable.

## Weather Alerts

The system automatically generates helpful alerts for:
- ⚡ Thunderstorm warnings
- 🌡️ High temperature alerts (>35°C)
- ❄️ Low temperature alerts (<10°C)
- 💨 Strong wind warnings (>30 km/h)
- 🌧️ Upcoming rain forecasts

## Troubleshooting

### "Location permission denied"
- Enable location access in your browser settings
- The app will use mock weather data if location is denied

### "Weather data not loading"
- Check your internet connection
- Verify your API key is correct (if using one)
- The app will automatically fall back to mock data if there's an error

### API Key Not Working
- Make sure the API key is active (new keys can take a few minutes)
- Free tier has a limit of 60 calls/minute (more than enough for this app)
- Check that the environment variable name is exactly `VITE_OPENWEATHER_API_KEY`

## Privacy Note

Your location data is:
- ✅ Only used to fetch weather information
- ✅ Never stored or sent to any server (except OpenWeatherMap for weather data)
- ✅ Requested fresh each time (no tracking)
- ✅ Completely optional (app works with mock data too)

## Free Tier Limits

OpenWeatherMap free tier includes:
- ✅ 60 calls per minute
- ✅ 1,000,000 calls per month
- ✅ Current weather data
- ✅ 5-day forecast
- ✅ Weather alerts

This is more than enough for the Plant n' Plan system!
