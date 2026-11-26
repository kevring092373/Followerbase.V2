import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "lib", "attribution.ts"), "utf8");

test("Attribution-Modul definiert First-Touch-Speicher und Quellen", () => {
  assert.match(src, /followerbase_attribution/);
  assert.match(src, /30 \* 24 \* 60 \* 60 \* 1000/);
  assert.match(src, /"google"/);
  assert.match(src, /"bing"/);
  assert.match(src, /"direct"/);
  assert.match(src, /"social"/);
  assert.match(src, /gclid/);
  assert.match(src, /msclkid/);
});

test("Öffentliche Bestellverfolgung gibt Attribution nicht heraus", () => {
  const tracking = readFileSync(join(root, "app", "bestellung-verfolgen", "actions.ts"), "utf8");
  assert.match(tracking, /orderNumber: order\.orderNumber, status: order\.status/);
  assert.equal(tracking.includes("attribution"), false);
});
