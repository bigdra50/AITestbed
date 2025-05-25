import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import type { WeatherData } from "../types/weather.ts";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

interface WeatherState {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
}

const locationState = signal<LocationState>({
  latitude: null,
  longitude: null,
  error: null,
  loading: false,
});

const weatherState = signal<WeatherState>({
  data: null,
  loading: false,
  error: null,
});

async function getCurrentLocation(): Promise<void> {
  if (!navigator.geolocation) {
    locationState.value = {
      ...locationState.value,
      error: "お使いのブラウザでは位置情報がサポートされていません",
      loading: false,
    };
    return;
  }

  locationState.value = {
    ...locationState.value,
    loading: true,
    error: null,
  };

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        locationState.value = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        };
        resolve();
      },
      (error) => {
        let errorMessage = "位置情報の取得に失敗しました";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "位置情報へのアクセスが拒否されました。ブラウザの設定を確認してください。";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "位置情報が利用できません";
            break;
          case error.TIMEOUT:
            errorMessage = "位置情報の取得がタイムアウトしました";
            break;
        }

        locationState.value = {
          ...locationState.value,
          error: errorMessage,
          loading: false,
        };
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5分間キャッシュ
      }
    );
  });
}

async function fetchWeatherData(lat: number, lon: number): Promise<void> {
  weatherState.value = {
    ...weatherState.value,
    loading: true,
    error: null,
  };

  try {
    const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    
    if (!response.ok) {
      throw new Error("天気情報の取得に失敗しました");
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    weatherState.value = {
      data,
      loading: false,
      error: null,
    };
  } catch (error) {
    weatherState.value = {
      ...weatherState.value,
      loading: false,
      error: error instanceof Error ? error.message : "天気情報の取得に失敗しました",
    };
  }
}

async function refreshWeatherData(): Promise<void> {
  const { latitude, longitude } = locationState.value;
  
  if (latitude !== null && longitude !== null) {
    await fetchWeatherData(latitude, longitude);
  } else {
    await getCurrentLocation();
  }
}

export function CurrentLocationWeather() {
  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    const { latitude, longitude } = locationState.value;
    
    if (latitude !== null && longitude !== null) {
      fetchWeatherData(latitude, longitude);
    }
  }, [locationState.value.latitude, locationState.value.longitude]);

  const location = locationState.value;
  const weather = weatherState.value;

  const isLoading = location.loading || weather.loading;
  const hasError = location.error || weather.error;

  const getWeatherIcon = (iconCode?: string): string => {
    if (!iconCode) return "🌤️";
    
    const iconMap: Record<string, string> = {
      "01d": "☀️", "01n": "🌙",
      "02d": "⛅", "02n": "☁️",
      "03d": "☁️", "03n": "☁️",
      "04d": "☁️", "04n": "☁️",
      "09d": "🌧️", "09n": "🌧️",
      "10d": "🌦️", "10n": "🌦️",
      "11d": "⛈️", "11n": "⛈️",
      "13d": "❄️", "13n": "❄️",
      "50d": "🌫️", "50n": "🌫️",
    };
    
    return iconMap[iconCode] || "🌤️";
  };

  const formatWindDirection = (degrees: number): string => {
    const directions = ["北", "北北東", "北東", "東北東", "東", "東南東", "南東", "南南東", "南", "南南西", "南西", "西南西", "西", "西北西", "北西", "北北西"];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  return (
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          現在地の天気
        </h2>
        <button
          type="button"
          onClick={refreshWeatherData}
          disabled={isLoading}
          class={`p-2 rounded-lg transition-colors ${
            isLoading
              ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800"
          }`}
          title="現在地を取得"
        >
          {isLoading ? "⏳" : "📍"}
        </button>
      </div>

      {hasError ? (
        <div class="text-center py-8">
          <div class="text-6xl mb-4">⚠️</div>
          <div class="text-red-600 dark:text-red-400 mb-4">
            {location.error || weather.error}
          </div>
          <button
            type="button"
            onClick={refreshWeatherData}
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            再試行
          </button>
        </div>
      ) : isLoading ? (
        <div class="text-center py-8">
          <div class="text-6xl mb-2 animate-pulse">🌤️</div>
          <div class="text-4xl font-bold text-gray-300 dark:text-gray-600 mb-2 animate-pulse">
            --°C
          </div>
          <div class="text-gray-600 dark:text-gray-400 mb-4">
            {location.loading ? "位置情報を取得中..." : "天気情報を取得中..."}
          </div>
          <div class="grid grid-cols-2 gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} class="text-center">
                <div class="text-sm text-gray-400 dark:text-gray-600 animate-pulse">---</div>
                <div class="text-lg font-semibold text-gray-300 dark:text-gray-600 animate-pulse">
                  ---
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : weather.data ? (
        <div class="text-center py-8">
          <div class="text-6xl mb-2">
            {getWeatherIcon(weather.data.current.icon)}
          </div>
          <div class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {weather.data.current.temperature}°C
          </div>
          <div class="text-gray-600 dark:text-gray-400 mb-2">
            {weather.data.current.weather}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {weather.data.location.name}, {weather.data.location.country}
          </div>

          <div class="grid grid-cols-2 gap-4 mt-6">
            <div class="text-center">
              <div class="text-sm text-gray-500 dark:text-gray-400">体感温度</div>
              <div class="text-lg font-semibold text-gray-900 dark:text-white">
                {weather.data.current.feelsLike}°C
              </div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-500 dark:text-gray-400">湿度</div>
              <div class="text-lg font-semibold text-gray-900 dark:text-white">
                {weather.data.current.humidity}%
              </div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-500 dark:text-gray-400">風速</div>
              <div class="text-lg font-semibold text-gray-900 dark:text-white">
                {weather.data.current.windSpeed} m/s
              </div>
              <div class="text-xs text-gray-400 dark:text-gray-500">
                {formatWindDirection(weather.data.current.windDirection)}
              </div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-500 dark:text-gray-400">視界</div>
              <div class="text-lg font-semibold text-gray-900 dark:text-white">
                {(weather.data.current.visibility / 1000).toFixed(1)} km
              </div>
            </div>
          </div>

          {weather.data.current.uvIndex > 0 && (
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div class="text-center">
                <div class="text-sm text-gray-500 dark:text-gray-400">UV指数</div>
                <div class="text-lg font-semibold text-gray-900 dark:text-white">
                  {weather.data.current.uvIndex}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div class="text-center py-8">
          <div class="text-6xl mb-2">🌤️</div>
          <div class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            --°C
          </div>
          <div class="text-gray-600 dark:text-gray-400 mb-4">
            位置情報を取得してください
          </div>
        </div>
      )}
    </div>
  );
}