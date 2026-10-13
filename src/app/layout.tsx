import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Research Design Assistant | Research Design Tutor",
  description: "Start research-design tutoring in your own ChatGPT account with the complete original tutor instructions, or explore a clearly labelled practice conversation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
