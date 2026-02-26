/**
 * Layout nur für Produktseiten: Wrapper für produktseitenspezifische
 * Mobile-Fixes (z. B. Scroll, Sticky-Header).
 */
export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="product-page-layout">{children}</div>;
}
