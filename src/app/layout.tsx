import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Research Design Assistant | Research Design Tutor",
  description: "An interactive research design tutor for university students. A local demo for guided questioning and critical thinking.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
