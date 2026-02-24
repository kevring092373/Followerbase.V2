"use client";

import { useEffect, useRef, useState } from "react";

const NOTIFICATIONS = [
  {
    id: "1",
    avatar: "LM",
    username: "lena_m",
    text: "und 12 andere folgen dir jetzt",
    type: "follow",
    time: "Jetzt",
  },
  {
    id: "2",
    avatar: "MP",
    username: "max.photo",
    text: "und 5 andere gefällt dein Beitrag",
    type: "like",
    time: "2 Min",
  },
  {
    id: "3",
    avatar: "SC",
    username: "sarah.creative",
    text: "hat deinen Kommentar geliked",
    type: "like",
    time: "5 Min",
  },
];

function AvatarCircle({ initials }: { initials: string }) {
  return (
    <span className="ig-overlay-avatar" aria-hidden>
      {initials}
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

function PhoneContent() {
  return (
    <>
      <div className="home-ig-overlay-phone-notch" aria-hidden />
      <div className="home-ig-overlay-screen">
        <div className="home-ig-overlay-header">
          <span className="home-ig-overlay-header-title">Benachrichtigungen</span>
        </div>
        <div className="home-ig-overlay-list">
          {NOTIFICATIONS.map((n) => (
            <div key={n.id} className="home-ig-overlay-item">
              <AvatarCircle initials={n.avatar} />
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
        <PhoneContent />
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
