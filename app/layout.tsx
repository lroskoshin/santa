import "./globals.css";

// Root layout - minimal wrapper, actual layout is in [locale]/layout.tsx
// We don't render <html> or <body> here because [locale]/layout.tsx does it
// with the correct locale-specific lang attribute
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
