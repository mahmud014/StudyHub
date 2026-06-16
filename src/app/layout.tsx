import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { StudyHubProvider } from "@/components/layout/StudyHubProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "স্টাডি হাব - Study Hub | ক্লাস ৯-১০ এর লার্নিং প্ল্যাটফর্ম",
  description:
    "ক্লাস ৯-১০ এর শিক্ষার্থীদের জন্য সম্পূর্ণ অনলাইন লার্নিং প্ল্যাটফর্ম। স্মার্ট নোটস, ভিডিও ক্লাস, অনলাইন পরীক্ষা, অ্যাসাইনমেন্ট এবং প্রশ্নোত্তর ফোরাম।",
  keywords: [
    "Study Hub",
    "স্টাডি হাব",
    "ক্লাস ৯-১০",
    "অনলাইন লার্নিং",
    "বাংলাদেশ",
    "শিক্ষা",
    "MCQ",
    "নোটস",
  ],
  authors: [{ name: "Md. Shukur Mahmud" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <StudyHubProvider>
            {children}
            <Toaster position="top-right" richColors />
          </StudyHubProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
