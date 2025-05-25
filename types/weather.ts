// docs/requirement.md:164 で定義された天気データの型定義

export interface WeatherData {
  location: {
    name: string;
    country: string;
    coordinates: {
      lat: number;
      lon: number;
    };
  };
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    weather: string;
    icon: string;
    visibility: number;
    uvIndex: number;
  };
  forecast?: {
    date: string;
    high: number;
    low: number;
    weather: string;
    icon: string;
    precipitation: number;
    windSpeed: number;
  }[];
  hourly?: {
    time: string;
    temperature: number;
    weather: string;
    icon: string;
    precipitation: number;
  }[];
}

export interface WeatherApiError {
  error: string;
}