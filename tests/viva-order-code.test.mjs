import assert from "node:assert/strict";
import test from "node:test";

function extractVivaId(raw, keys) {
  for (const key of keys) {
    const re = new RegExp(`"${key}"\\s*:\\s*(?:"(\\d+)"|(\\d+))`, "i");
    const match = raw.match(re);
    const id = match?.[1] || match?.[2];
    if (id) return id;
  }
  return null;
}

test("Viva orderCode bleibt als String erhalten (auch 16-stellig)", () => {
  const rawNumber = '{"orderCode":7271532565172601}';
  const rawUnsafe = '{"OrderCode":9007199254740993}';
  assert.equal(extractVivaId(rawNumber, ["orderCode", "OrderCode"]), "7271532565172601");
  assert.equal(extractVivaId(rawUnsafe, ["orderCode", "OrderCode"]), "9007199254740993");
  assert.notEqual(String(JSON.parse(rawUnsafe).OrderCode), "9007199254740993");
});
