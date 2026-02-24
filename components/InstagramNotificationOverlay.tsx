"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const NOTIFICATION_IMAGES = [
  "/icons/Instabild1.webp",
  "/icons/Instabild2.webp",
  "/icons/Instabild3.webp",
] as const;

const NOTIFICATIONS = [
  {
    id: "1",
    username: "lena_m",
    text: "und 12 andere folgen dir jetzt",
    type: "follow",
    time: "Jetzt",
  },
  {
    id: "2",
    username: "max.photo",
    text: "und 5 andere gefällt dein Beitrag",
    type: "like",
    time: "2 Min",
  },
  {
    id: "3",
    username: "sarah.creative",
    text: "hat deinen Kommentar geliked",
    type: "like",
    time: "5 Min",
  },
];

const STATS_TARGETS = { likes: 450, followers: 100 };
const COUNT_UP_DURATION_MS = 1800;
const COUNT_UP_START_DELAY_MS = 400;

function easeOutQuart(t: number) {
  return 1 - (1 - t) ** 4;
}

function useCountUp(visible: boolean, target: number, delayMs: number) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!visible || started.current || target <= 0) return;
    started.current = true;

    const startTime = performance.now() + delayMs;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed <= 0) {
        setValue(0);
        requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(elapsed / COUNT_UP_DURATION_MS, 1);
      const eased = easeOutQuart(progress);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };

    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [visible, target, delayMs]);

  return value;
}

function AvatarCircle({ src }: { src: string }) {
  return (
    <span className="ig-overlay-avatar ig-overlay-avatar-img" aria-hidden>
      <Image src={src} alt="" width={44} height={44} sizes="44px" />
    </span>
  );
}

const TAB_ITEMS = [
  { id: "home", label: "Start", icon: "home" },
  { id: "search", label: "Suchen", icon: "search" },
  { id: "reels", label: "Reels", icon: "reels" },
  { id: "activity", label: "Aktivität", icon: "heart", badge: "100" },
  { id: "profile", label: "Profil", icon: "profile" },
];

function PhoneContent({ visible }: { visible: boolean }) {
  const likes = useCountUp(visible, STATS_TARGETS.likes, COUNT_UP_START_DELAY_MS);
  const followers = useCountUp(visible, STATS_TARGETS.followers, COUNT_UP_START_DELAY_MS + 80);

  return (
    <>
      <div className="home-ig-overlay-screen">
        <div className="home-ig-overlay-phone-notch" aria-hidden />
        <div className="home-ig-overlay-screen-inner">
        <div className="home-ig-overlay-header">
          <span className="home-ig-overlay-header-title">Benachrichtigungen</span>
        </div>
        <div className="home-ig-overlay-stats-bar">
          <span className="home-ig-overlay-stat">
            <span className="home-ig-overlay-stat-icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
            </span>
            <span className="home-ig-overlay-stat-num">{likes}</span>
          </span>
          <span className="home-ig-overlay-stat">
            <span className="home-ig-overlay-stat-icon home-ig-overlay-stat-icon-person" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </span>
            <span className="home-ig-overlay-stat-num">{followers}</span>
          </span>
        </div>
        <div className="home-ig-overlay-list">
          {NOTIFICATIONS.map((n, i) => (
            <div key={n.id} className="home-ig-overlay-item">
              <AvatarCircle src={NOTIFICATION_IMAGES[i]} />
              <div className="home-ig-overlay-body">
                <p className="home-ig-overlay-text">
                  <strong className="home-ig-overlay-username">{n.username}</strong>{" "}
                  <span className="home-ig-overlay-desc">{n.text}</span>
                </p>
                <span className="home-ig-overlay-time">{n.time}</span>
              </div>
              {n.type === "follow" && (
                <span className="home-ig-overlay-follow-btn">Folgen</span>
              )}
            </div>
          ))}
        </div>
        <nav className="home-ig-overlay-tabs" aria-label="Instagram Navigation">
          {TAB_ITEMS.map((tab) => (
            <span key={tab.id} className="home-ig-overlay-tab">
              <span className={`home-ig-overlay-tab-icon home-ig-overlay-tab-icon-${tab.icon}`} aria-hidden />
              {tab.badge != null && (
                <span className="home-ig-overlay-tab-badge">{tab.badge}</span>
              )}
            </span>
          ))}
        </nav>
        </div>
      </div>
    </>
  );
}

export function InstagramNotificationOverlay({ compact = false }: { compact?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisible(true);
      },
      { threshold: 0.2, rootMargin: "0px 0px -50px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const wrapEl = (
    <div className={`home-ig-overlay-wrap ${visible ? "home-ig-overlay-visible" : ""}`}>
      <div className="home-ig-overlay-phone">
        <div className="home-ig-overlay-phone-buttons-left" aria-hidden>
          <span /><span /><span />
        </div>
        <div className="home-ig-overlay-phone-buttons-right" aria-hidden>
          <span />
        </div>
        <PhoneContent visible={visible} />
      </div>
    </div>
  );

  if (compact) {
    return (
      <div ref={wrapRef} className="home-ig-overlay-compact">
        {wrapEl}
      </div>
    );
  }

  return (
    <section
      ref={wrapRef as React.RefObject<HTMLElement>}
      className="home-ig-overlay-section"
      aria-labelledby="home-ig-overlay-heading"
    >
      <h2 id="home-ig-overlay-heading" className="home-section-label home-ig-overlay-title">
        So sieht dein Erfolg aus
      </h2>
      <p className="home-ig-overlay-intro">
        Echte Benachrichtigungen – mehr Follower und Likes auf deinem Profil.
      </p>
      {wrapEl}
    </section>
  );
}
