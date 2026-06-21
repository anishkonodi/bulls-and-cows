import type { Metadata } from "next";
import "./globals.css";
import SessionKeeper from "../components/SessionKeeper";

export const metadata: Metadata = {
  title: "Bulls and Cows | Code-Breaking Game",
  description: "A modern version of the classic Bulls and Cows game. Challenge the System in this strategic number duel!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <SessionKeeper />
        {children}
      </body>
    </html>
  );
}
