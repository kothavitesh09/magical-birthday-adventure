import type { Metadata } from "next";
import "./globals.css";
import SceneTransitionOverlay from "@/components/ui/SceneTransitionOverlay";

export const metadata: Metadata = {
  title: "Birthday Adventure · Panda Playground",
  description: "A little magical playground for a very special birthday.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<SceneTransitionOverlay /></body></html>;
}
