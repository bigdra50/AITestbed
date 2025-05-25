import { ThemeToggle } from "../islands/ThemeToggle.tsx";

export function Header() {
  return (
    <header class="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span class="text-blue-600 text-xl font-bold">☀</span>
            </div>
            <h1 class="text-xl font-bold text-white">
              Weather App
            </h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}