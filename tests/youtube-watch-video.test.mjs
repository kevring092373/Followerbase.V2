import assert from "node:assert/strict";
import test from "node:test";
import {
  inspectYouTubeWatchVideoTarget,
  isYouTubeWatchVideoTarget,
} from "../lib/youtube-watch-video.ts";

test("YouTube-Watchtime-URL-Parser akzeptiert watch und youtu.be", () => {
  assert.equal(isYouTubeWatchVideoTarget("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), true);
  assert.equal(isYouTubeWatchVideoTarget("https://youtu.be/dQw4w9WgXcQ"), true);
  assert.equal(isYouTubeWatchVideoTarget("youtube.com/watch?v=dQw4w9WgXcQ&t=12s"), true);
  assert.equal(inspectYouTubeWatchVideoTarget("https://www.youtube.com/watch?v=dQw4w9WgXcQ").ok, true);
});

test("YouTube-Watchtime-URL-Parser lehnt Kanal, Shorts, Playlist, Live und Listen ab", () => {
  assert.equal(isYouTubeWatchVideoTarget("https://www.youtube.com/@kanal"), false);
  assert.equal(isYouTubeWatchVideoTarget("https://www.youtube.com/channel/UC1234567890123456789012"), false);
  assert.equal(isYouTubeWatchVideoTarget("https://www.youtube.com/shorts/dQw4w9WgXcQ"), false);
  assert.equal(isYouTubeWatchVideoTarget("https://www.youtube.com/playlist?list=PLtest"), false);
  assert.equal(isYouTubeWatchVideoTarget("https://www.youtube.com/live/dQw4w9WgXcQ"), false);
  assert.equal(isYouTubeWatchVideoTarget("https://youtube.com.fremde-domain/watch?v=dQw4w9WgXcQ"), false);
  assert.equal(
    inspectYouTubeWatchVideoTarget(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ https://youtu.be/dQw4w9WgXcQ"
    ).reason,
    "multiple"
  );
  assert.equal(inspectYouTubeWatchVideoTarget("").reason, "empty");
});
