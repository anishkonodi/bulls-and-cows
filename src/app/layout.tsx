import type { Metadata } from "next";
import "./globals.css";
import SessionKeeper from "../components/SessionKeeper";

export const metadata: Metadata = {
  title: "Bulls and Cows | Code-Breaking Game",
  description: "A modern version of the classic Bulls and Cows game. Challenge the System in this strategic number duel!",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'dark';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <SessionKeeper />
        {children}
      </body>
    </html>
  );
}
