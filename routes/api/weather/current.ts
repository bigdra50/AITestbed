import type { Handlers } from "$fresh/server.ts";
import type { WeatherData } from "../../../types/weather.ts";

interface OpenWeatherCurrentResponse {
  name: string;
  sys: {
    country: string;
  };
  coord: {
    lat: number;
    lon: number;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  visibility: number;
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
    return `current:${lat},${lon}`;
  }
  if (city) {
    return `current:${city}`;
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

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const lat = url.searchParams.get("lat");
    const lon = url.searchParams.get("lon");
    const city = url.searchParams.get("city");

    // パラメータ検証
    if (!lat && !lon && !city) {
      return new Response(
        JSON.stringify({
          error: "座標（lat, lon）または都市名（city）が必要です",
        }),
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
    const cacheKey = getCacheKey(
      lat || undefined,
      lon || undefined,
      city || undefined,
    );
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
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;
      } else if (city) {
        // 都市名による検索
        apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${
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
            JSON.stringify({
              error: "APIレート制限に達しました。しばらく後でお試しください。",
            }),
            {
              status: 429,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        throw new Error(`OpenWeatherMap API error: ${response.status}`);
      }

      const data: OpenWeatherCurrentResponse = await response.json();

      // WeatherDataインターフェースに従ってデータを変換
      const weatherData: WeatherData = {
        location: {
          name: data.name,
          country: data.sys.country,
          coordinates: {
            lat: data.coord.lat,
            lon: data.coord.lon,
          },
        },
        current: {
          temperature: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          windDirection: data.wind.deg,
          weather: data.weather[0].description,
          icon: data.weather[0].icon,
          visibility: data.visibility,
          uvIndex: 0, // OpenWeatherMap の無料プランでは利用不可
        },
      };

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
      console.error("Current weather API error:", error);

      return new Response(
        JSON.stringify({
          error:
            "現在の天気情報の取得に失敗しました。しばらく後でお試しください。",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
};
