/**
 * ============================================
 * WEATHER DATA SERVICE
 * ============================================
 * 
 * This file handles weather data fetching and processing:
 * - Auto-detects user location
 * - Fetches real-time weather from OpenWeatherMap API
 * - Provides mock data as fallback
 * - Formats weather data for display
 * 
 * API Key Required: Get free key from https://openweathermap.org/api
 */

import { projectId } from './supabase/info';

/**
 * Weather Data Interface
 * Defines the structure of weather information used in the app
 */
export interface WeatherData {
  current: {
    temp: number;          // Temperature in Celsius
    condition: "sunny" | "cloudy" | "rainy" | "snow" | "thunderstorm" | "mist";
    humidity: number;      // Humidity percentage
    windSpeed: number;     // Wind speed in m/s
    description: string;   // Weather description (e.g., "light rain")
    feelsLike: number;     // "Feels like" temperature
  };
  forecast: Array<{
    day: string;           // Day of week
    temp: number;          // Forecasted temperature
    condition: "sunny" | "cloudy" | "rainy" | "snow" | "thunderstorm" | "mist";
    description: string;   // Weather description
  }>;
  alerts: string[];        // Weather alerts or farming tips
  location: {
    city: string;          // City name
    country: string;       // Country code
  };
}

/**
 * Geolocation Position Interface
 * Geographic coordinates for weather lookup
 */
interface GeolocationPosition {
  latitude: number;
  longitude: number;
}

/**
 * Map OpenWeatherMap condition codes to simplified conditions
 * 
 * OpenWeatherMap uses numeric codes (200-899):
 * - 200-299: Thunderstorm
 * - 300-399: Drizzle
 * - 500-599: Rain
 * - 600-699: Snow
 * - 700-799: Atmosphere (mist, fog, etc.)
 * - 800: Clear
 * - 801-899: Clouds
 * 
 * @param weatherCode - OpenWeatherMap weather code
 * @param weatherMain - Main weather category
 * @returns Simplified weather condition
 */
const mapWeatherCondition = (weatherCode: number, weatherMain: string): WeatherData["current"]["condition"] => {
  // Thunderstorm (200-232)
  if (weatherCode >= 200 && weatherCode < 300) return "thunderstorm";
  
  // Drizzle (300-321) or Rain (500-531)
  if ((weatherCode >= 300 && weatherCode < 400) || (weatherCode >= 500 && weatherCode < 600)) return "rainy";
  
  // Snow (600-622)
  if (weatherCode >= 600 && weatherCode < 700) return "snow";
  
  // Atmosphere (701-781) - mist, fog, etc.
  if (weatherCode >= 700 && weatherCode < 800) return "mist";
  
  // Clear (800)
  if (weatherCode === 800) return "sunny";
  
  // Clouds (801-804)
  if (weatherCode > 800) return "cloudy";
  
  // Default to sunny
  return "sunny";
};

/**
 * Get user's current location using browser geolocation API
 */
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * Fetch weather data from OpenWeatherMap API
 * Note: Users need to get a free API key from https://openweathermap.org/api
 */
export const fetchWeatherData = async (
  latitude: number,
  longitude: number,
  apiKey?: string
): Promise<WeatherData> => {
  // Use environment variable or provided API key
  const key = apiKey || import.meta.env.VITE_OPENWEATHER_API_KEY;
  
  if (!key) {
    console.warn("OpenWeatherMap API key not found. Using mock data.");
    return getMockWeatherData();
  }

  try {
    // Fetch current weather
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}&units=metric`
    );

    if (!currentResponse.ok) {
      throw new Error(`Weather API error: ${currentResponse.status}`);
    }

    const currentData = await currentResponse.json();

    // Fetch 5-day forecast (we'll take next 3 days)
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${key}&units=metric`
    );

    if (!forecastResponse.ok) {
      throw new Error(`Forecast API error: ${forecastResponse.status}`);
    }

    const forecastData = await forecastResponse.json();

    // Process forecast data - get one forecast per day for next 3 days
    const dailyForecasts: WeatherData["forecast"] = [];
    const processedDates = new Set<string>();
    const today = new Date().toDateString();

    for (const item of forecastData.list) {
      const date = new Date(item.dt * 1000);
      const dateString = date.toDateString();

      // Skip today and only process if we haven't seen this date
      if (dateString !== today && !processedDates.has(dateString) && dailyForecasts.length < 3) {
        processedDates.add(dateString);
        
        // Get day name
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = dayNames[date.getDay()];

        dailyForecasts.push({
          day: dailyForecasts.length === 0 ? "Tomorrow" : dayName,
          temp: Math.round(item.main.temp),
          condition: mapWeatherCondition(item.weather[0].id, item.weather[0].main),
          description: item.weather[0].description,
        });
      }

      if (dailyForecasts.length === 3) break;
    }

    // Generate weather alerts based on conditions
    const alerts: string[] = [];
    
    // Check for extreme weather in current conditions
    if (currentData.weather[0].id >= 200 && currentData.weather[0].id < 300) {
      alerts.push("⚡ Thunderstorm warning! Keep indoor activities and protect sensitive plants.");
    }
    if (currentData.main.temp > 35) {
      alerts.push("🌡️ High temperature alert! Ensure adequate watering for your crops.");
    }
    if (currentData.main.temp < 10) {
      alerts.push("❄️ Low temperature alert! Protect frost-sensitive plants.");
    }
    if (currentData.wind.speed > 30) {
      alerts.push("💨 Strong wind warning! Secure loose items and provide support for tall plants.");
    }

    // Check forecast for heavy rain
    const hasHeavyRain = dailyForecasts.some(day => day.condition === "rainy");
    if (hasHeavyRain) {
      alerts.push("🌧️ Rain expected in the coming days. Plan your watering schedule accordingly.");
    }

    return {
      current: {
        temp: Math.round(currentData.main.temp),
        condition: mapWeatherCondition(currentData.weather[0].id, currentData.weather[0].main),
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
        description: currentData.weather[0].description,
        feelsLike: Math.round(currentData.main.feels_like),
      },
      forecast: dailyForecasts,
      alerts,
      location: {
        city: currentData.name,
        country: currentData.sys.country,
      },
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
};

/**
 * Get mock weather data as fallback
 */
export const getMockWeatherData = (): WeatherData => {
  return {
    current: {
      temp: 28,
      condition: "sunny",
      humidity: 65,
      windSpeed: 12,
      description: "clear sky",
      feelsLike: 30,
    },
    forecast: [
      { day: "Tomorrow", temp: 29, condition: "sunny", description: "clear sky" },
      { day: "Day 2", temp: 27, condition: "cloudy", description: "few clouds" },
      { day: "Day 3", temp: 26, condition: "rainy", description: "light rain" },
    ],
    alerts: ["⚠️ Using sample weather data. To get real weather for Kabankalan City, an admin needs to add an OpenWeatherMap API key."],
    location: {
      city: "Kabankalan City",
      country: "PH",
    },
  };
};

/**
 * Get configured location from backend
 */
const getConfiguredLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    if (!projectId) {
      return null;
    }

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a8901673/public/location`
    );

    if (!response.ok) {
      // Silently return null on error - this is expected for public endpoint
      return null;
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      console.log("✅ Using configured location:", result.data.city);
      return {
        latitude: result.data.latitude,
        longitude: result.data.longitude,
      };
    }

    return null;
  } catch (error) {
    // Silently return null - public endpoint may not be available yet
    return null;
  }
};

/**
 * Get weather data with automatic location detection
 * First tries to use admin-configured location, then falls back to geolocation
 */
export const getWeatherWithLocation = async (apiKey?: string): Promise<WeatherData> => {
  // First, try to get admin-configured location
  try {
    const configuredLocation = await getConfiguredLocation();
    
    if (configuredLocation) {
      console.log("✅ Using admin-configured location for weather:", configuredLocation);
      try {
        const weatherData = await fetchWeatherData(
          configuredLocation.latitude, 
          configuredLocation.longitude, 
          apiKey
        );
        console.log("✅ Successfully fetched weather data for:", weatherData.location.city);
        return weatherData;
      } catch (weatherError) {
        console.warn("⚠️ Failed to fetch weather with configured location:", weatherError);
        console.log("Falling back to mock data...");
        return getMockWeatherData();
      }
    } else {
      console.log("ℹ️ No configured location found, using default Kabankalan City");
    }
  } catch (error) {
    console.warn("⚠️ Could not fetch configured location:", error);
  }

  // If no configured location, fall back to mock data immediately
  // (Skip geolocation since we want to use Kabankalan City as default)
  console.log("📍 Using default location (Kabankalan City) with sample weather data");
  return getMockWeatherData();
};
