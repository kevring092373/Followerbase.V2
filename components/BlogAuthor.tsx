/**
 * Autor-Box für Blog-Beiträge: Moritz Sachmann
 */
import Image from "next/image";

const AUTHOR_IMAGE = "/icons/Autor Moritz.webp";

export function BlogAuthor() {
  return (
    <aside className="blog-author" aria-label="Autor">
      <div className="blog-author-inner">
        <div className="blog-author-avatar" aria-hidden>
          <Image
            src={AUTHOR_IMAGE}
            alt=""
            width={56}
            height={56}
            sizes="56px"
            className="blog-author-avatar-img"
          />
        </div>
        <div className="blog-author-text">
          <p className="blog-author-name">Moritz Sachmann</p>
          <p className="blog-author-role">Social Media Experte</p>
          <p className="blog-author-bio">
            Langjährige Erfahrung mit Reichweitenaufbau und Community-Management für Instagram, TikTok und YouTube. Unterstützt Creator und Marken dabei, organisch und strategisch zu wachsen.
          </p>
        </div>
      </div>
    </aside>
  );
}
