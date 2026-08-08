import Image from "next/image";

const NOTIFS = [
  {
    img: "/icons/Instabild1.webp",
    name: "lena_m",
    text: "und 12 andere folgen dir jetzt",
    time: "Jetzt",
    follow: true,
  },
  {
    img: "/icons/Instabild2.webp",
    name: "max.photo",
    text: "und 5 anderen gefällt dein Beitrag",
    time: "2 Min",
    follow: false,
  },
  {
    img: "/icons/Instabild3.webp",
    name: "sarah.creative",
    text: "hat deinen Kommentar geliked",
    time: "5 Min",
    follow: false,
  },
] as const;

export function HomePhoneMockup() {
  return (
    <div className="hero-visual">
      <div className="phone" aria-hidden>
        <div className="phone-notch" />
        <div className="phone-screen">
          <div className="phone-head">Benachrichtigungen</div>
          {NOTIFS.map((n) => (
            <div key={n.name} className="notif">
              <span className="notif-av notif-av-img">
                <Image src={n.img} alt="" width={34} height={34} sizes="34px" />
              </span>
              <p>
                <b>{n.name}</b> {n.text} <time>· {n.time}</time>
              </p>
              {n.follow && <span className="follow-btn">Folgen</span>}
            </div>
          ))}
          <div className="phone-counter">
            <div className="num">+1.284</div>
            <div className="lbl">Neue Follower diese Woche</div>
          </div>
        </div>
      </div>
      <span className="float-chip chip-1">📸 +500 Follower</span>
      <span className="float-chip chip-2">❤️ +250 Likes</span>
      <span className="float-chip chip-3">▶️ +10k Views</span>
      <span className="float-chip chip-4">🚀 Drip-Feed aktiv</span>
    </div>
  );
}
