/**
 * Meldet gezielt geänderte URLs an IndexNow (Bing).
 * Aufruf: node scripts/indexnow-ping.js
 */
const INDEXNOW_KEY = process.env.INDEXNOW_KEY?.trim() || "a8c39dc9f6e64c79b59409b682c15d4c";
const HOST = "followerbase.de";
const SITE = `https://${HOST}`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

const URLS = [
  `${SITE}/product/youtube-views-kaufen`,
  `${SITE}/products/youtube`,
  `${SITE}/product/youtube-likes-kaufen`,
  `${SITE}/product/youtube-watchtime-kaufen`,
  `${SITE}/product/youtube-follower-kaufen`,
  `${SITE}/blog/youtube-abonnenten-bekommen`,
];

async function main() {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
      urlList: URLS,
    }),
  });
  const text = await res.text();
  console.log("IndexNow Status:", res.status);
  if (text) console.log(text);
  console.log("URLs:", URLS.join("\n"));
  if (res.status !== 200 && res.status !== 202) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
