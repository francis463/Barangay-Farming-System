# Weather API Setup Guide

The Plant n' Plan system now features **centralized barangay location settings** for accurate, real-time weather forecasts!

## Features
- 📍 **Barangay Location Settings** - Admin configures one location for entire barangay
- 🌤️ **Real-time weather data** from OpenWeatherMap for Kabankalan City
- 📊 **3-day forecast** for better planning
- ⚠️ **Smart weather alerts** for extreme conditions
- 🔄 **Manual refresh** button to update weather data

## How It Works

1. **Default Location**: System is pre-configured for **Kabankalan City, Negros Occidental, Philippines**
2. **Admin Settings**: Admins can fine-tune the exact coordinates in Location Settings
3. **Real Weather Data**: With API key configured, shows actual weather for your barangay
4. **Fallback**: Without API key, shows sample weather data for Kabankalan City

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

## Admin: Configure Exact Location

Admins can fine-tune the barangay location:

1. Go to **Location Settings** in the admin menu
2. Either:
   - Use **Detect Location** button (uses your current position)
   - Or manually enter coordinates (find them on Google Maps)
3. Click **Save Location Settings**
4. All users will now see weather for this exact location!

**To find coordinates on Google Maps:**
- Right-click on your barangay location
- Click the coordinates to copy them
- Paste into the Location Settings form

## Troubleshooting

### "Using sample weather data" message
- This means no OpenWeatherMap API key is configured
- Weather still shows for Kabankalan City, but uses sample data
- To get real-time weather, add your API key (see steps above)

### "Weather data not loading"
- Check your internet connection
- Verify your API key is correct (if using one)
- The app will automatically fall back to sample data if there's an error

### API Key Not Working
- Make sure the API key is active (new keys can take a few minutes)
- Free tier has a limit of 60 calls/minute (more than enough for this app)
- Check that the environment variable name is exactly `VITE_OPENWEATHER_API_KEY`

## Privacy Note

Location data:
- ✅ Configured once by admin for entire barangay
- ✅ Only used to fetch weather information
- ✅ Only coordinates sent to OpenWeatherMap for weather data
- ✅ No individual user location tracking
- ✅ Completely optional (app works with sample data too)

## Free Tier Limits

OpenWeatherMap free tier includes:
- ✅ 60 calls per minute
- ✅ 1,000,000 calls per month
- ✅ Current weather data
- ✅ 5-day forecast
- ✅ Weather alerts

This is more than enough for the Plant n' Plan system!

## Current Configuration

✅ **Default Location**: Kabankalan City, Negros Occidental, Philippines
- Latitude: 9.9833
- Longitude: 122.8167
- Timezone: Asia/Manila (PHT)

All users see weather for this location unless admin changes it in Location Settings.
