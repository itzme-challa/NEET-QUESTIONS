import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import NextTopLoader from 'nextjs-toploader';
import Script from 'next/script'

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  manifest: "/manifest.json", 
  title: "NeetPrep",
  description: "Chapter and Page wise NCERT questions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <meta name="viewport" content= "width=device-width, user-scalable=no"/>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader showSpinner={false}/>
          <SiteHeader></SiteHeader>
          <main>{children}</main>
        </ThemeProvider>
        <Script src="https://umami.coolify.akashdeep.pro/script.js" data-website-id="689bb58a-6b31-44a9-b3bf-1f7756af6c42" />
        <Script data-domain="neet-prep.vercel.app" src="https://plausible.io/js/script.js" />
      </body>
    </html>
  );
}
