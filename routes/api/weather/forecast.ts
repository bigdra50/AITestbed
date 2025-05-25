import type { Handlers } from "$fresh/server.ts";
import type { WeatherData } from "../../../types/weather.ts";

interface OpenWeatherForecastResponse {
  city: {
    name: string;
    country: string;
    coord: {
      lat: number;
      lon: number;
    };
  };
  list: Array<{
    dt: number;
    main: {
      temp: number;
      temp_min: number;
      temp_max: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
    };
    pop: number; // 降水確率
    rain?: {
      "3h"?: number;
    };
    snow?: {
      "3h"?: number;
    };
    dt_txt: string;
  }>;
}

// メモリキャッシュ（5分間）
interface CacheEntry {
  data: WeatherData;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分間

function getCacheKey(lat?: string, lon?: string, city?: string): string {
  if (lat && lon) {
    return `forecast:${lat},${lon}`;
  }
  if (city) {
    return `forecast:${city}`;
  }
  return "";
}

function getCachedData(key: string): WeatherData | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data;
  }
  if (entry) {
    cache.delete(key);
  }
  return null;
}

function setCachedData(key: string, data: WeatherData): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

function processForecastData(data: OpenWeatherForecastResponse): WeatherData {
  // 5日間の予報データを処理
  const dailyForecasts = new Map<string, {
    date: string;
    temps: number[];
    weather: string;
    icon: string;
    precipitation: number;
    windSpeed: number;
  }>();

  // 時間別データを処理
  const hourlyData = data.list.slice(0, 24).map(item => ({
    time: new Date(item.dt * 1000).toISOString(),
    temperature: Math.round(item.main.temp),
    weather: item.weather[0].description,
    icon: item.weather[0].icon,
    precipitation: (item.rain?.["3h"] || 0) + (item.snow?.["3h"] || 0),
  }));

  // 日別データを集約
  data.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    if (!dailyForecasts.has(dateStr)) {
      dailyForecasts.set(dateStr, {
        date: dateStr,
        temps: [],
        weather: item.weather[0].description,
        icon: item.weather[0].icon,
        precipitation: (item.rain?.["3h"] || 0) + (item.snow?.["3h"] || 0),
        windSpeed: item.wind.speed,
      });
    }
    
    const forecast = dailyForecasts.get(dateStr)!;
    forecast.temps.push(item.main.temp);
    
    // 降水量を累積
    forecast.precipitation += (item.rain?.["3h"] || 0) + (item.snow?.["3h"] || 0);
  });

  // 5日間の予報データを作成
  const forecastArray = Array.from(dailyForecasts.values()).slice(0, 5).map(forecast => ({
    date: forecast.date,
    high: Math.round(Math.max(...forecast.temps)),
    low: Math.round(Math.min(...forecast.temps)),
    weather: forecast.weather,
    icon: forecast.icon,
    precipitation: Math.round(forecast.precipitation * 10) / 10, // 小数点1桁
    windSpeed: forecast.windSpeed,
  }));

  return {
    location: {
      name: data.city.name,
      country: data.city.country,
      coordinates: {
        lat: data.city.coord.lat,
        lon: data.city.coord.lon,
      },
    },
    current: {
      temperature: Math.round(data.list[0].main.temp),
      feelsLike: Math.round(data.list[0].main.temp), // 予報データにfeels_likeは含まれない
      humidity: 0, // 予報データから取得不可
      windSpeed: data.list[0].wind.speed,
      windDirection: 0, // 予報データから取得不可
      weather: data.list[0].weather[0].description,
      icon: data.list[0].weather[0].icon,
      visibility: 0, // 予報データから取得不可
      uvIndex: 0, // 予報データから取得不可
    },
    forecast: forecastArray,
    hourly: hourlyData,
  };
}

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const lat = url.searchParams.get("lat");
    const lon = url.searchParams.get("lon");
    const city = url.searchParams.get("city");

    // パラメータ検証
    if (!lat && !lon && !city) {
      return new Response(
        JSON.stringify({ error: "座標（lat, lon）または都市名（city）が必要です" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if ((lat && !lon) || (!lat && lon)) {
      return new Response(
        JSON.stringify({ error: "緯度と経度は両方指定する必要があります" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // キャッシュチェック
    const cacheKey = getCacheKey(lat || undefined, lon || undefined, city || undefined);
    if (cacheKey) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return new Response(JSON.stringify(cachedData), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=300",
            "X-Cache": "HIT",
          },
        });
      }
    }

    // API キーの取得
    const apiKey = Deno.env.get("OPENWEATHER_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OpenWeatherMap APIキーが設定されていません" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    try {
      let apiUrl: string;

      if (lat && lon) {
        // 座標による検索
        apiUrl =
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;
      } else if (city) {
        // 都市名による検索
        apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${
          encodeURIComponent(city)
        }&appid=${apiKey}&units=metric&lang=ja`;
      } else {
        return new Response(
          JSON.stringify({ error: "座標または都市名が必要です" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const response = await fetch(apiUrl);

      if (!response.ok) {
        if (response.status === 401) {
          return new Response(
            JSON.stringify({ error: "APIキーが無効です" }),
            {
              status: 401,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        if (response.status === 404) {
          return new Response(
            JSON.stringify({ error: "指定された都市が見つかりません" }),
            {
              status: 404,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "APIレート制限に達しました。しばらく後でお試しください。" }),
            {
              status: 429,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        throw new Error(`OpenWeatherMap Forecast API error: ${response.status}`);
      }

      const data: OpenWeatherForecastResponse = await response.json();

      // WeatherDataインターフェースに従ってデータを変換
      const weatherData = processForecastData(data);

      // キャッシュに保存
      if (cacheKey) {
        setCachedData(cacheKey, weatherData);
      }

      // レスポンスを返却
      const headers = new Headers({
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
        "X-Cache": "MISS",
      });

      return new Response(JSON.stringify(weatherData), { headers });
    } catch (error) {
      console.error("Forecast API error:", error);

      return new Response(
        JSON.stringify({
          error: "天気予報情報の取得に失敗しました。しばらく後でお試しください。",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
};