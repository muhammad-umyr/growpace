import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Growpace — Every child grows at their own pace",
  description: "AI-powered developmental tracking for children from birth to age 7.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#F4F3FC] antialiased`}>
        {children}
      </body>
    </html>
  );
}
