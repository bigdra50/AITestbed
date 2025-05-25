import { Head } from "$fresh/runtime.ts";
import { Header } from "../components/Header.tsx";
import { SearchBar } from "../islands/SearchBar.tsx";
import CurrentLocationWeather from "../islands/CurrentLocationWeather.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Weather App - 天気予報アプリケーション</title>
        <meta
          name="description"
          content="現在地や指定した都市の天気情報を確認できる天気予報アプリケーション"
        />
      </Head>

      <div class="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700">
        <Header />

        <main class="container mx-auto px-4 py-8">
          {/* 検索バー */}
          <div class="mb-8">
            <SearchBar />
          </div>

          {/* 現在地天気カード */}
          <div class="mb-8">
            <CurrentLocationWeather />
          </div>

          {/* 5日間予報セクション - 後で実装 */}
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-white mb-4">5日間予報</h2>
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <p class="text-gray-600 dark:text-gray-400 text-center">
                5日間予報機能は開発中です
              </p>
            </div>
          </div>

          {/* 詳細情報セクション - 後で実装 */}
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-white mb-4">詳細情報</h2>
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <p class="text-gray-600 dark:text-gray-400 text-center">
                詳細グラフ機能は開発中です
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
