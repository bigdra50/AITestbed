import { computed, signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { WeatherData } from "../types/weather.ts";

// 位置情報の状態管理
interface LocationState {
  status: "idle" | "requesting" | "granted" | "denied" | "error";
  coordinates?: { lat: number; lon: number };
  error?: string;
}

// 天気データの状態管理
interface WeatherState {
  status: "idle" | "loading" | "loaded" | "error";
  data?: WeatherData;
  error?: string;
}

const locationState = signal<LocationState>({ status: "idle" });
const weatherState = signal<WeatherState>({ status: "idle" });

// 現在位置を取得する関数（Lintエラー修正：asyncキーワードを削除）
function getCurrentLocation(): Promise<void> {
  return new Promise((resolve, reject) => {
    locationState.value = { status: "requesting" };

    if (!navigator.geolocation) {
      const error = "位置情報がサポートされていません";
      locationState.value = { status: "error", error };
      reject(new Error(error));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        locationState.value = { status: "granted", coordinates };
        resolve();
      },
      (error) => {
        let errorMessage = "位置情報の取得に失敗しました";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "位置情報の利用が拒否されました";
            locationState.value = { status: "denied", error: errorMessage };
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "位置情報が利用できません";
            locationState.value = { status: "error", error: errorMessage };
            break;
          case error.TIMEOUT:
            errorMessage = "位置情報の取得がタイムアウトしました";
            locationState.value = { status: "error", error: errorMessage };
            break;
          default:
            locationState.value = { status: "error", error: errorMessage };
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5分間キャッシュ
      },
    );
  });
}

// 天気データを取得する関数
async function fetchWeatherData(lat: number, lon: number): Promise<void> {
  try {
    weatherState.value = { status: "loading" };

    const response = await fetch(`/api/weather/current?lat=${lat}&lon=${lon}`);

    if (!response.ok) {
      throw new Error(`天気データの取得に失敗しました: ${response.status}`);
    }

    const data: WeatherData = await response.json();
    weatherState.value = { status: "loaded", data };
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : "天気データの取得に失敗しました";
    weatherState.value = { status: "error", error: errorMessage };
  }
}

// 再取得ボタンのハンドラー
function handleRefresh(): void {
  locationState.value = { status: "idle" };
  weatherState.value = { status: "idle" };
  getCurrentLocation()
    .then(() => {
      const coords = locationState.value.coordinates;
      if (coords) {
        fetchWeatherData(coords.lat, coords.lon);
      }
    })
    .catch((error) => {
      console.error("位置情報の取得に失敗:", error);
    });
}

// 天気アイコンのURL生成
const getWeatherIconUrl = (icon: string): string => {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
};

// 風向きを度数から方角に変換
const getWindDirection = (degrees: number): string => {
  const directions = [
    "北",
    "北北東",
    "北東",
    "東北東",
    "東",
    "東南東",
    "南東",
    "南南東",
    "南",
    "南南西",
    "南西",
    "西南西",
    "西",
    "西北西",
    "北西",
    "北北西",
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

// ローディングスケルトンコンポーネント
function LoadingSkeleton() {
  return (
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg animate-pulse">
      <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-1/2"></div>
      <div class="flex items-center mb-6">
        <div class="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded mr-4"></div>
        <div>
          <div class="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-2 w-20"></div>
          <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
        </div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} class="text-center">
            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// エラー表示コンポーネント
function ErrorDisplay(
  { error, onRetry }: { error: string; onRetry: () => void },
) {
  return (
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      <div class="text-center">
        <div class="text-red-500 text-5xl mb-4">⚠️</div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          エラーが発生しました
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={onRetry}
          class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          再試行
        </button>
      </div>
    </div>
  );
}

// メインコンポーネント
export default function CurrentLocationWeather() {
  // 初回マウント時に位置情報を取得
  useEffect(() => {
    getCurrentLocation()
      .then(() => {
        const coords = locationState.value.coordinates;
        if (coords) {
          fetchWeatherData(coords.lat, coords.lon);
        }
      })
      .catch((error) => {
        console.error("位置情報の取得に失敗:", error);
      });
  }, []);

  // ローディング状態の表示
  if (
    locationState.value.status === "requesting" ||
    weatherState.value.status === "loading"
  ) {
    return <LoadingSkeleton />;
  }

  // エラー状態の表示
  if (
    locationState.value.status === "denied" ||
    locationState.value.status === "error"
  ) {
    return (
      <ErrorDisplay
        error={locationState.value.error || "エラーが発生しました"}
        onRetry={handleRefresh}
      />
    );
  }

  if (weatherState.value.status === "error") {
    return (
      <ErrorDisplay
        error={weatherState.value.error || "天気データの取得に失敗しました"}
        onRetry={handleRefresh}
      />
    );
  }

  // 天気データが読み込まれていない場合
  if (weatherState.value.status !== "loaded" || !weatherState.value.data) {
    return <LoadingSkeleton />;
  }

  const weather = weatherState.value.data;

  return (
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      {/* ヘッダー */}
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-800 dark:text-white">
            現在地の天気
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {weather.location.name}, {weather.location.country}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          class="text-blue-500 hover:text-blue-600 p-2 rounded-lg transition-colors"
          title="更新"
        >
          🔄
        </button>
      </div>

      {/* メイン天気情報 */}
      <div class="flex items-center mb-6">
        <img
          src={getWeatherIconUrl(weather.current.icon)}
          alt={weather.current.weather}
          class="w-16 h-16 mr-4"
        />
        <div>
          <div class="text-3xl font-bold text-gray-800 dark:text-white">
            {Math.round(weather.current.temperature)}°C
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            体感温度 {Math.round(weather.current.feelsLike)}°C
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400 capitalize">
            {weather.current.weather}
          </div>
        </div>
      </div>

      {/* 詳細情報グリッド */}
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="text-gray-600 dark:text-gray-400 mb-1">湿度</div>
          <div class="font-semibold text-gray-800 dark:text-white">
            {weather.current.humidity}%
          </div>
        </div>

        <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="text-gray-600 dark:text-gray-400 mb-1">風速</div>
          <div class="font-semibold text-gray-800 dark:text-white">
            {weather.current.windSpeed} m/s
          </div>
        </div>

        <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="text-gray-600 dark:text-gray-400 mb-1">風向</div>
          <div class="font-semibold text-gray-800 dark:text-white">
            {getWindDirection(weather.current.windDirection)}
          </div>
        </div>

        <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="text-gray-600 dark:text-gray-400 mb-1">視界</div>
          <div class="font-semibold text-gray-800 dark:text-white">
            {(weather.current.visibility / 1000).toFixed(1)} km
          </div>
        </div>

        <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="text-gray-600 dark:text-gray-400 mb-1">UV指数</div>
          <div class="font-semibold text-gray-800 dark:text-white">
            {weather.current.uvIndex}
          </div>
        </div>

        <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="text-gray-600 dark:text-gray-400 mb-1">位置</div>
          <div class="font-semibold text-gray-800 dark:text-white text-xs">
            {weather.location.coordinates.lat.toFixed(2)},{" "}
            {weather.location.coordinates.lon.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
