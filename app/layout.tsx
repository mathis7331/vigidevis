import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import Script from "next/script";
import { Toaster } from "sonner";
import ClarityInitializer from "@/components/ClarityInitializer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VigiDevis | Analyse de devis travaux par IA : Économisez gros !",
  description: "Ne payez plus vos travaux trop cher. VigiDevis analyse vos devis en 1 minute grâce à l'IA. Recevez un rapport détaillé et négociez comme un pro.",
  openGraph: {
    title: "VigiDevis | Analyse de devis travaux par IA : Économisez gros !",
    description: "Ne payez plus vos travaux trop cher. VigiDevis analyse vos devis en 1 minute grâce à l'IA. Recevez un rapport détaillé et négociez comme un pro.",
    type: 'website',
  },
  // La favicon est automatiquement détectée depuis app/icon.svg par Next.js
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
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




