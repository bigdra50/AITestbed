import { Handlers } from "$fresh/server.ts";

// OpenWeatherMap API の型定義
interface OpenWeatherResponse {
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

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const lat = url.searchParams.get("lat");
    const lon = url.searchParams.get("lon");
    const city = url.searchParams.get("city");

    // API キーの取得
    const apiKey = Deno.env.get("OPENWEATHER_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    try {
      let apiUrl: string;
      
      if (lat && lon) {
        // 座標による検索
        apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;
      } else if (city) {
        // 都市名による検索
        apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=ja`;
      } else {
        return new Response(
          JSON.stringify({ error: "座標または都市名が必要です" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        if (response.status === 404) {
          return new Response(
            JSON.stringify({ error: "都市が見つかりません" }),
            {
              status: 404,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        
        throw new Error(`OpenWeatherMap API error: ${response.status}`);
      }

      const data: OpenWeatherResponse = await response.json();

      // データを変換
      const weatherData = {
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

      // キャッシュヘッダーを設定（5分間）
      const headers = new Headers({
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      });

      return new Response(JSON.stringify(weatherData), { headers });
    } catch (error) {
      console.error("Weather API error:", error);
      
      return new Response(
        JSON.stringify({ 
          error: "天気情報の取得に失敗しました。しばらく後でお試しください。" 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};