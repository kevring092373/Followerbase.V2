export interface Review {
  id: string;
  author: string;
  text: string;
  rating: number;
  verified: boolean;
  /** Optional: z. B. "Instagram Follower" für verifizierte Käufe */
  productHint?: string;
}

export const reviews: Review[] = [
  {
    id: "1",
    author: "Sarah M.",
    text: "Super unkompliziert. Habe Instagram Follower bestellt – Lieferung war schnell und die Qualität passt. Gerne wieder!",
    rating: 5,
    verified: true,
    productHint: "Instagram Follower",
  },
  {
    id: "2",
    author: "Tim K.",
    text: "Erste Bestellung hier. Alles lief reibungslos, Preis war fair. Werde definitiv nochmal bestellen.",
    rating: 5,
    verified: false,
  },
  {
    id: "3",
    author: "Lisa R.",
    text: "TikTok Likes bestellt – genau wie beschrieben geliefert. Support hat schnell geantwortet, als ich eine Frage hatte.",
    rating: 5,
    verified: true,
    productHint: "TikTok Likes",
  },
  {
    id: "4",
    author: "Jan P.",
    text: "Endlich ein Anbieter ohne Abo-Falle. Einmal zahlen, fertig. So soll es sein.",
    rating: 5,
    verified: false,
  },
  {
    id: "5",
    author: "Nina W.",
    text: "Habe für meinen kleinen Shop Reichweite gebraucht. Instagram Follower und Likes bestellt – Ergebnis hat mich überzeugt.",
    rating: 5,
    verified: true,
    productHint: "Instagram Follower & Likes",
  },
  {
    id: "6",
    author: "Max B.",
    text: "Schnelle Abwicklung, klare Preise. Bestellung verfolgen funktioniert einwandfrei.",
    rating: 5,
    verified: false,
  },
  {
    id: "7",
    author: "Julia S.",
    text: "YouTube Views für ein neues Video – pünktlich gestartet. Bin zufrieden und werde es weiterempfehlen.",
    rating: 5,
    verified: true,
    productHint: "YouTube Views",
  },
  {
    id: "8",
    author: "David L.",
    text: "Unkompliziert von der Bestellung bis zur Lieferung. Keine versteckten Kosten, genau wie angegeben.",
    rating: 5,
    verified: false,
  },
];
