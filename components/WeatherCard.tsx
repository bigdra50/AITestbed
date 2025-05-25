export function WeatherCard() {
  return (
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          現在地の天気
        </h2>
        <button
          type="button"
          class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          title="現在地を取得"
        >
          📍
        </button>
      </div>

      <div class="text-center py-8">
        <div class="text-6xl mb-2">🌤️</div>
        <div class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          --°C
        </div>
        <div class="text-gray-600 dark:text-gray-400 mb-4">
          位置情報を取得中...
        </div>

        <div class="grid grid-cols-2 gap-4 mt-6">
          <div class="text-center">
            <div class="text-sm text-gray-500 dark:text-gray-400">体感温度</div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              --°C
            </div>
          </div>
          <div class="text-center">
            <div class="text-sm text-gray-500 dark:text-gray-400">湿度</div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              --%
            </div>
          </div>
          <div class="text-center">
            <div class="text-sm text-gray-500 dark:text-gray-400">風速</div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              -- m/s
            </div>
          </div>
          <div class="text-center">
            <div class="text-sm text-gray-500 dark:text-gray-400">視界</div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              -- km
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
