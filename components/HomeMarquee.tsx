"use client";

const PLATFORMS = [
  "Instagram", "TikTok", "YouTube", "Snapchat", "Reddit", "Telegram",
  "Facebook", "Threads", "Follower", "Likes", "Views", "Reichweite",
];

export function HomeMarquee() {
  return (
    <div className="home-marquee" aria-hidden>
      <div className="home-marquee-track">
        {[...PLATFORMS, ...PLATFORMS].map((name, i) => (
          <span key={i} className="home-marquee-item">
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
