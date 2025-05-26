// E2Eテストサンプル
import { assertEquals } from "https://deno.land/std@0.220.0/assert/mod.ts";

Deno.test("Basic E2E - Homepage elements", async () => {
  const response = await fetch("http://localhost:8082/");
  assertEquals(response.status, 200);

  const html = await response.text();

  // 基本的な要素が存在することを確認
  assertEquals(html.includes("Weather App"), true);
  assertEquals(html.includes("都市名を入力..."), true); // プレースホルダーのテキスト
  // assertEquals(html.includes("現在地の天気"), true); // クライアントサイドでレンダリングされるため、初期HTMLには含まれない
});

Deno.test("Basic E2E - Theme toggle functionality", () => {
  // テーマ切り替え機能のE2Eテスト
  // JavaScriptが有効な環境でのテストが必要
  console.log("Theme toggle E2E test - implementation needed");
});
