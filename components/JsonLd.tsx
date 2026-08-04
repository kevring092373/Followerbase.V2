/**
 * Gibt strukturierte Daten (JSON-LD) für Google aus.
 * "<" wird escaped, damit Inhalte aus Supabase das script-Tag nicht schließen können.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
