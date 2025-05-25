import { useState } from "preact/hooks";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      // 都市検索のロジックは後で実装
      console.log("Searching for:", query);
      // TODO: API 呼び出しと結果表示
      await new Promise(resolve => setTimeout(resolve, 500)); // 一時的な遅延
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="max-w-md mx-auto">
      <form onSubmit={handleSubmit} class="relative">
        <div class="relative">
          <input
            type="text"
            placeholder="都市名を入力..."
            value={query}
            onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
            class="w-full pl-12 pr-16 py-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
            disabled={isLoading}
          />
          
          {/* 検索アイコン */}
          <div class="absolute left-4 top-1/2 transform -translate-y-1/2">
            <svg 
              class="w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
          
          {/* 検索ボタン */}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            class="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isLoading ? (
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              "検索"
            )}
          </button>
        </div>
      </form>
      
      {/* 検索履歴エリア - 後で実装 */}
      <div class="mt-4">
        <div class="text-sm text-white/70 mb-2">最近検索した都市</div>
        <div class="flex flex-wrap gap-2">
          {/* 検索履歴のタグは後で実装 */}
          <span class="text-xs text-white/50">検索履歴は実装予定です</span>
        </div>
      </div>
    </div>
  );
}