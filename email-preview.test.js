const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "email-preview.html"), "utf8");

test("email preview page targets email1.html and exposes reload controls", () => {
  assert.match(html, /<h1>Preview `email1\.html`<\/h1>/);
  assert.match(html, /id="reload-preview"/);
  assert.match(html, /const emailPath = "\.\/email1\.html";/);
  assert.match(html, /window\.addEventListener\("focus", refreshPreview\);/);
  assert.match(html, /title="Preview of email1\.html"/);
});

test("email preview page shows an explicit empty state for blank files", () => {
  assert.match(html, /id="empty-state" class="empty-state"/);
  assert.match(html, /`email1\.html` is empty/);
  assert.match(html, /html\.trim\(\)\.length === 0/);
  assert.match(html, /setPreviewState\(isEmpty\);/);
});
