import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
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
      <body className={`${nunito.className} min-h-screen bg-[#fffbf7] antialiased`}>
        {children}
      </body>
    </html>
  );
}
