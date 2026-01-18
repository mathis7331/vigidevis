import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { Suspense } from "react";
import Script from "next/script";
import { Toaster } from "sonner";
import ClarityInitializer from "@/components/ClarityInitializer";
import { FaviconHead } from "@/components/FaviconHead";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata: Metadata = {
  title: "VINTED-TURBO | Analyse de vêtements par IA : Vendez plus cher !",
  description: "Arrêtez de galérer avec vos descriptions. VINTED-TURBO analyse vos vêtements en 30 secondes grâce à l'IA. Recevez une annonce optimisée et vendez plus vite.",
  openGraph: {
    title: "VINTED-TURBO | Analyse de vêtements par IA : Vendez plus cher !",
    description: "Arrêtez de galérer avec vos descriptions. VINTED-TURBO analyse vos vêtements en 30 secondes grâce à l'IA. Recevez une annonce optimisée et vendez plus vite.",
    type: 'website',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
    shortcut: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} ${sora.variable}`}>
        <FaviconHead />
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17813601165"
          strategy="afterInteractive"
        />
        <Script id="google-ads-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17813601165');
          `}
        </Script>
        <ClarityInitializer />
        <Suspense fallback={null}>
          {children}
        </Suspense>
        <Toaster 
          position="top-center" 
          richColors 
          expand={true}
          duration={4000}
        />
      </body>
    </html>
  );
}




