import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bulls and Cows | Code-Breaking Game",
  description: "A modern version of the classic Bulls and Cows game. Challenge the AI in this strategic number duel!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
