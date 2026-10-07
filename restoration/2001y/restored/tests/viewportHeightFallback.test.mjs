import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../styles/variable.scss", import.meta.url),
  "utf8",
);

test("viewport height has an iOS/WebView fallback before dynamic viewport overrides", () => {
  assert.match(source, /--100vh:\s*100vh;/);
  assert.match(source, /@supports\s*\(height:\s*100dvh\)[\s\S]*?--100vh:\s*100dvh;/);
});
