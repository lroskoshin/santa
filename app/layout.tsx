import "./globals.css";

// Root layout - minimal wrapper, actual layout is in [locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-[#0c1222] text-white antialiased">
        {children}
      </body>
    </html>
  );
}

