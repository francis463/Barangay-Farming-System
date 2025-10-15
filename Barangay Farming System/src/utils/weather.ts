// Weather API service using OpenWeatherMap

export interface WeatherData {
  current: {
    temp: number;
    condition: "sunny" | "cloudy" | "rainy" | "snow" | "thunderstorm" | "mist";
    humidity: number;
    windSpeed: number;
    description: string;
    feelsLike: number;
  };
  forecast: Array<{
    day: string;
    temp: number;
    condition: "sunny" | "cloudy" | "rainy" | "snow" | "thunderstorm" | "mist";
    description: string;
  }>;
  alerts: string[];
  location: {
    city: string;
    country: string;
  };
}

interface GeolocationPosition {
  latitude: number;
  longitude: number;
}

// Map OpenWeatherMap condition codes to our simplified conditions
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
  
  // Default
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
    alerts: ["Using mock weather data. Enable location access for accurate forecasts."],
    location: {
      city: "Your Location",
      country: "PH",
    },
  };
};

/**
 * Get weather data with automatic location detection
 */
export const getWeatherWithLocation = async (apiKey?: string): Promise<WeatherData> => {
  try {
    const location = await getCurrentLocation();
    return await fetchWeatherData(location.latitude, location.longitude, apiKey);
  } catch (error) {
    console.error("Error getting weather with location:", error);
    // Return mock data as fallback
    return getMockWeatherData();
  }
};
