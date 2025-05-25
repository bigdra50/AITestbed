import type { Handlers } from "$fresh/server.ts";

interface OpenWeatherGeoResponse {
  name: string;
  local_names?: {
    [key: string]: string;
  };
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

interface CitySearchResult {
  name: string;
  country: string;
  state?: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  displayName: string;
}

// メモリキャッシュ（5分間）
interface CacheEntry {
  data: CitySearchResult[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分間

function getCacheKey(query: string): string {
  return `search:${query.toLowerCase()}`;
}

function getCachedData(key: string): CitySearchResult[] | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data;
  }
  if (entry) {
    cache.delete(key);
  }
  return null;
}

function setCachedData(key: string, data: CitySearchResult[]): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

function formatCityData(cities: OpenWeatherGeoResponse[]): CitySearchResult[] {
  return cities.map(city => {
    // 日本語の地名があれば使用、なければ英語名
    const japaneseNames = city.local_names?.ja || city.local_names?.["ja-JP"];
    const name = japaneseNames || city.name;
    
    // 表示名を作成（都市名, 州/地域, 国）
    let displayName = name;
    if (city.state) {
      displayName += `, ${city.state}`;
    }
    displayName += `, ${city.country}`;

    return {
      name,
      country: city.country,
      state: city.state,
      coordinates: {
        lat: city.lat,
        lon: city.lon,
      },
      displayName,
    };
  });
}

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const query = url.searchParams.get("q");
    const limitParam = url.searchParams.get("limit");

    // パラメータ検証
    if (!query) {
      return new Response(
        JSON.stringify({ error: "検索クエリ（q）が必要です" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (query.length < 2) {
      return new Response(
        JSON.stringify({ error: "検索クエリは2文字以上で入力してください" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // 結果数の制限（デフォルト5、最大10）
    const limit = Math.min(parseInt(limitParam || "5", 10), 10);

    // キャッシュチェック
    const cacheKey = getCacheKey(`${query}:${limit}`);
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return new Response(JSON.stringify({ cities: cachedData }), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
          "X-Cache": "HIT",
        },
      });
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
      // Geocoding APIを使用して都市を検索
      const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${
        encodeURIComponent(query)
      }&limit=${limit}&appid=${apiKey}`;

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

        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "APIレート制限に達しました。しばらく後でお試しください。" }),
            {
              status: 429,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        throw new Error(`OpenWeatherMap Geocoding API error: ${response.status}`);
      }

      const data: OpenWeatherGeoResponse[] = await response.json();

      // データを整形
      const cities = formatCityData(data);

      // キャッシュに保存
      setCachedData(cacheKey, cities);

      // レスポンスを返却
      const headers = new Headers({
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
        "X-Cache": "MISS",
      });

      return new Response(JSON.stringify({ cities }), { headers });
    } catch (error) {
      console.error("City search API error:", error);

      return new Response(
        JSON.stringify({
          error: "都市検索に失敗しました。しばらく後でお試しください。",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
};