import type { Handlers } from "$fresh/server.ts";
import type { WeatherData } from "../../types/weather.ts";

// OpenWeatherMap API の型定義
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

interface OpenWeatherForecastResponse {
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
    pop: number; // precipitation probability
    dt_txt: string;
  }>;
}

interface GeocodingResponse {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint") || "current";
    const lat = url.searchParams.get("lat");
    const lon = url.searchParams.get("lon");
    const city = url.searchParams.get("city");
    const query = url.searchParams.get("q");

    // API キーの取得
    const apiKey = Deno.env.get("OPENWEATHER_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    try {
      switch (endpoint) {
        case "search":
          return await handleCitySearch(query, apiKey);
        case "forecast":
          return await handleForecast(lat, lon, city, apiKey);
        case "current":
        default:
          return await handleCurrent(lat, lon, city, apiKey);
      }
    } catch (error) {
      console.error("Weather API error:", error);
      return new Response(
        JSON.stringify({
          error: "天気情報の取得に失敗しました。しばらく後でお試しください。",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
};

async function handleCurrent(
  lat: string | null,
  lon: string | null,
  city: string | null,
  apiKey: string,
): Promise<Response> {
  if (!lat && !lon && !city) {
    return new Response(
      JSON.stringify({ error: "座標または都市名が必要です" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  let apiUrl: string;
  if (lat && lon) {
    apiUrl =
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;
  } else if (city) {
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
    if (response.status === 404) {
      return new Response(
        JSON.stringify({ error: "都市が見つかりません" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    throw new Error(`OpenWeatherMap API error: ${response.status}`);
  }

  const data: OpenWeatherCurrentResponse = await response.json();

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

  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=300", // 5分間キャッシュ
  });

  return new Response(JSON.stringify(weatherData), { headers });
}

async function handleForecast(
  lat: string | null,
  lon: string | null,
  city: string | null,
  apiKey: string,
): Promise<Response> {
  if (!lat && !lon && !city) {
    return new Response(
      JSON.stringify({ error: "座標または都市名が必要です" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // まず current weather を取得して座標を確保
  let coordinates: { lat: number; lon: number };
  let locationInfo: { name: string; country: string };

  if (lat && lon) {
    coordinates = { lat: parseFloat(lat), lon: parseFloat(lon) };
    // 座標から位置情報を取得
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`,
    );
    if (!currentResponse.ok) {
      throw new Error(`Current weather API error: ${currentResponse.status}`);
    }
    const currentData: OpenWeatherCurrentResponse = await currentResponse
      .json();
    locationInfo = { name: currentData.name, country: currentData.sys.country };
  } else if (city) {
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${
        encodeURIComponent(city)
      }&appid=${apiKey}&units=metric&lang=ja`,
    );
    if (!currentResponse.ok) {
      if (currentResponse.status === 404) {
        return new Response(
          JSON.stringify({ error: "都市が見つかりません" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      throw new Error(`Current weather API error: ${currentResponse.status}`);
    }
    const currentData: OpenWeatherCurrentResponse = await currentResponse
      .json();
    coordinates = currentData.coord;
    locationInfo = { name: currentData.name, country: currentData.sys.country };
  } else {
    return new Response(
      JSON.stringify({ error: "座標または都市名が必要です" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // 5日間予報とcurrent weatherの両方を取得
  const [currentResponse, forecastResponse] = await Promise.all([
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${apiKey}&units=metric&lang=ja`,
    ),
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${apiKey}&units=metric&lang=ja`,
    ),
  ]);

  if (!currentResponse.ok || !forecastResponse.ok) {
    throw new Error("Failed to fetch weather data");
  }

  const [currentData, forecastData]: [
    OpenWeatherCurrentResponse,
    OpenWeatherForecastResponse,
  ] = await Promise.all([
    currentResponse.json(),
    forecastResponse.json(),
  ]);

  // 5日間の日別予報を作成
  const dailyForecast = processDailyForecast(forecastData.list);

  // 24時間の時間別予報を作成
  const hourlyForecast = processHourlyForecast(forecastData.list);

  const weatherData: WeatherData = {
    location: {
      name: locationInfo.name,
      country: locationInfo.country,
      coordinates: coordinates,
    },
    current: {
      temperature: Math.round(currentData.main.temp),
      feelsLike: Math.round(currentData.main.feels_like),
      humidity: currentData.main.humidity,
      windSpeed: currentData.wind.speed,
      windDirection: currentData.wind.deg,
      weather: currentData.weather[0].description,
      icon: currentData.weather[0].icon,
      visibility: currentData.visibility,
      uvIndex: 0,
    },
    forecast: dailyForecast,
    hourly: hourlyForecast,
  };

  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=300", // 5分間キャッシュ
  });

  return new Response(JSON.stringify(weatherData), { headers });
}

async function handleCitySearch(
  query: string | null,
  apiKey: string,
): Promise<Response> {
  if (!query || query.trim().length < 2) {
    return new Response(
      JSON.stringify({ error: "検索クエリは2文字以上で入力してください" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${
      encodeURIComponent(query.trim())
    }&limit=10&appid=${apiKey}`,
  );

  if (!response.ok) {
    throw new Error(`Geocoding API error: ${response.status}`);
  }

  const data: GeocodingResponse[] = await response.json();

  const cities = data.map((city) => ({
    name: city.name,
    country: city.country,
    state: city.state,
    coordinates: {
      lat: city.lat,
      lon: city.lon,
    },
    displayName: city.state
      ? `${city.name}, ${city.state}, ${city.country}`
      : `${city.name}, ${city.country}`,
  }));

  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=1800", // 30分間キャッシュ
  });

  return new Response(JSON.stringify({ cities }), { headers });
}

function processDailyForecast(
  forecastList: OpenWeatherForecastResponse["list"],
) {
  const dailyData = new Map<string, {
    temps: number[];
    weather: string;
    icon: string;
    precipitation: number;
    windSpeed: number;
  }>();

  forecastList.forEach((item) => {
    const date = new Date(item.dt * 1000).toISOString().split("T")[0];

    if (!dailyData.has(date)) {
      dailyData.set(date, {
        temps: [],
        weather: item.weather[0].description,
        icon: item.weather[0].icon,
        precipitation: item.pop * 100,
        windSpeed: item.wind.speed,
      });
    }

    dailyData.get(date)!.temps.push(item.main.temp);
  });

  return Array.from(dailyData.entries())
    .slice(0, 5) // 5日間のみ
    .map(([date, data]) => ({
      date,
      high: Math.round(Math.max(...data.temps)),
      low: Math.round(Math.min(...data.temps)),
      weather: data.weather,
      icon: data.icon,
      precipitation: Math.round(data.precipitation),
      windSpeed: data.windSpeed,
    }));
}

function processHourlyForecast(
  forecastList: OpenWeatherForecastResponse["list"],
) {
  return forecastList
    .slice(0, 24) // 24時間のみ
    .map((item) => ({
      time: new Date(item.dt * 1000).toISOString(),
      temperature: Math.round(item.main.temp),
      weather: item.weather[0].description,
      icon: item.weather[0].icon,
      precipitation: Math.round(item.pop * 100),
    }));
}
